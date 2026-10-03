/**
 * Where a policy is looked for, and what the help says about it.
 *
 * Pins the policy-filename decision of ADR 0009 (FE-01):
 *
 *   * default discovery is relative to the framework install directory, not the working directory;
 *   * the help text says so, rather than reading as a cwd-relative path;
 *   * the supported filename, project-policy.yml, is stated outside any heuristic, and no surface
 *     describes another spelling as supported (ADR 0009).
 *
 * No test here asserts that a .yaml or any other spelling works.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, readFile, mkdtemp, rm } from "node:fs/promises";
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

test("an explicit --policy path to a project-policy.yml evaluates as the default does", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-explicit-"));
  try {
    const file = path.join(dir, "project-policy.yml");
    await writeFile(file, await readFile(path.join(ROOT, "project-policy.yml"), "utf8"), "utf8");
    const explicit = await cliIn(ROOT, "status", "--policy", file, "--json");
    const byDefault = await cliIn(ROOT, "status", "--json");
    assert.equal(explicit.code, 0);
    assert.equal(explicit.stdout, byDefault.stdout);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("neither help nor the architecture reference describes project-policy.yaml as supported", async () => {
  const { stdout } = await cliIn(ROOT, "--help");
  const docs = await readFile(path.join(ROOT, "docs/architecture.md"), "utf8");
  for (const [name, text] of [["help", stdout], ["docs/architecture.md", docs]]) {
    assert.doesNotMatch(text, /project-policy\.yaml/, `${name} mentions project-policy.yaml`);
    assert.doesNotMatch(text, /any filename is accepted/, `${name} endorses any filename`);
  }
});

test("INSTRUCTIONS.md and PROJECT.md state that project-policy.yml is the only supported name", async () => {
  const instructions = await readFile(path.join(ROOT, "INSTRUCTIONS.md"), "utf8");
  const project = await readFile(path.join(ROOT, "PROJECT.md"), "utf8");
  assert.match(instructions, /`project-policy\.yml`, and that is the only supported spelling/);
  assert.match(project, /`project-policy\.yml` \(the only supported filename/);
});
