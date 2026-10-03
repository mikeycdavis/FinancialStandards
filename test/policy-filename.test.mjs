/**
 * Where a policy is looked for, and what the help says about it.
 *
 * Pins three facts that were measured rather than stated, so that a later decision about the
 * framework's policy-filename vocabulary changes them deliberately and visibly:
 *
 *   * default discovery is relative to the framework install directory, not the working directory;
 *   * the help text says so, rather than reading as a cwd-relative path;
 *   * an explicit --policy is filename-agnostic.
 *
 * These tests do NOT assert which filenames are the framework's vocabulary. That is a decision this
 * file does not make.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "scripts/standards.mjs");

async function cliIn(cwd, ...args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [CLI, ...args], { cwd, maxBuffer: 20e6 });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

test("help does not describe the default policy as relative to the current directory", async () => {
  const { stdout } = await cliIn(ROOT, "--help");
  const line = stdout.split("\n").find((l) => l.includes("--policy"));
  assert.ok(line, "help lists --policy");
  assert.match(line, /framework install directory/);
  assert.doesNotMatch(line, /default: \.\//);
});

test("default discovery ignores a project-policy.yml in the working directory", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-cwd-"));
  try {
    // Unparseable on purpose: if discovery were cwd-relative this would exit 2.
    await writeFile(path.join(dir, "project-policy.yml"), "this: [is: not valid\n", "utf8");
    const fromHere = await cliIn(dir, "status", "--json");
    const fromRoot = await cliIn(ROOT, "status", "--json");
    assert.equal(fromRoot.code, 0);
    assert.equal(fromHere.code, 0);
    assert.equal(fromHere.stdout, fromRoot.stdout);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an explicit --policy is read whatever its filename is", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-name-"));
  try {
    const body = await (await import("node:fs/promises")).readFile(path.join(ROOT, "project-policy.yml"), "utf8");
    const results = [];
    for (const name of ["project-policy.yml", "project-policy.yaml", "anything-at-all.txt"]) {
      const file = path.join(dir, name);
      await writeFile(file, body, "utf8");
      results.push({ name, ...(await cliIn(ROOT, "status", "--policy", file, "--json")) });
    }
    for (const r of results) {
      assert.equal(r.code, 0, `${r.name} exits ${r.code}`);
      assert.equal(r.stdout, results[0].stdout, `${r.name} evaluates as .yml does`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
