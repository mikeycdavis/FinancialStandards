/**
 * Pins the version-source decision of ADR 0010 (FE-04):
 *
 *   - `VERSION` is the single source of the framework release version.
 *   - `package.json` `version` and the README "Version" line mirror it and must equal it.
 *   - A policy's `standardVersion` is a pin, not the release version: it must be valid and must not
 *     be greater than `VERSION`.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseYaml } from "../scripts/yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const parts = (v) => v.match(SEMVER).slice(1).map(Number);
const greater = (a, b) => {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

const VERSION = read("VERSION").trim();

test("VERSION holds a plain semantic version", () => {
  assert.match(VERSION, SEMVER);
});

test("package.json version equals VERSION, the single source of the release version", () => {
  assert.equal(JSON.parse(read("package.json")).version, VERSION);
});

test("the README version line equals VERSION", () => {
  const match = read("README.md").match(/^Version (\S+) ·/m);
  assert.ok(match, "README has no 'Version X · ...' line");
  assert.equal(match[1], VERSION);
});

test("this repository's policy pin is a valid version and is not newer than the framework", () => {
  const policy = parseYaml(read("project-policy.yml"));
  assert.match(policy.standardVersion, SEMVER);
  assert.equal(greater(policy.standardVersion, VERSION), false);
});
