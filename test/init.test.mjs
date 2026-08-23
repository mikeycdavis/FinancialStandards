/**
 * `standards init`: the safety contract, which IS the design.
 *
 * The source directive requires that dry-run and apply derive from the same underlying plan, so that
 * a dry run accurately represents what would happen. That is satisfied structurally rather than by
 * discipline — `plan()` computes, `apply()` executes what `plan()` computed, and there is no second
 * code path to keep in step. These tests hold that structure to its promise.
 *
 * The other property defended here is that mutating is not destructive. Creating a missing artifact
 * is ordinary work and needs no approval; replacing an existing one is refused by default and
 * reported as a conflict. Overwriting requires naming the exact path.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { plan, apply, render, MODES } from "../scripts/init.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** A throwaway target project. */
async function scratch(fn, build) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-init-"));
  try {
    if (build) await build(dir);
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const files = async (dir) => {
  const found = [];
  const walk = async (rel) => {
    for (const entry of await readdir(path.join(dir, rel), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(child);
      else found.push(child);
    }
  };
  await walk("");
  return found.sort();
};

// --- The dry-run contract -------------------------------------------------------------------------

test("a dry run writes nothing", async () => {
  await scratch(async (dir) => {
    await plan(dir);
    assert.deepEqual(await files(dir), [], "plan() must not touch the filesystem");
  });
});

test("apply writes exactly what the plan listed, and nothing else", async () => {
  // The directive's requirement, stated as a test: the preview is the thing that happens, not a
  // description of it. Both sides read the same `actions` array.
  await scratch(async (dir) => {
    const planned = await plan(dir);
    await apply(dir, planned);
    const written = await files(dir);
    const promised = planned.created.filter((p) => !p.endsWith("/")).sort();
    assert.deepEqual(written, promised);
  });
});

test("a second apply is idempotent — it finds what the first wrote and leaves it alone", async () => {
  await scratch(async (dir) => {
    await apply(dir, await plan(dir));
    const after = await files(dir);
    const second = await plan(dir);
    assert.deepEqual(second.created, [], "nothing should be created twice");
    assert.ok(second.preserved.length > 0, "the existing artifacts should be preserved");
    await apply(dir, second);
    assert.deepEqual(await files(dir), after, "a second run must not change the filesystem");
  });
});

// --- Mutating is not destructive -------------------------------------------------------------------

test("an existing file that differs from its template is a conflict, and is left untouched", async () => {
  await scratch(async (dir) => {
    const target = path.join(dir, "PROJECT.md");
    await writeFile(target, "# Something the owner wrote\n", "utf8");
    const planned = await plan(dir);

    const conflict = planned.conflicts.find((c) => c.path === "PROJECT.md");
    assert.ok(conflict, "a differing file must be reported as a conflict");
    assert.match(conflict.remediation, /--force-overwrite=PROJECT\.md/);

    await apply(dir, planned);
    assert.equal(await readFile(target, "utf8"), "# Something the owner wrote\n", "the file must be untouched");
  });
});

test("overwriting requires naming the exact path, and approving one path does not approve another", async () => {
  await scratch(async (dir) => {
    await writeFile(path.join(dir, "PROJECT.md"), "# owner content\n", "utf8");
    await writeFile(path.join(dir, "AGENTS.md"), "# owner content\n", "utf8");

    const planned = await plan(dir, { overwrite: ["PROJECT.md"] });
    assert.deepEqual(planned.overwrites, ["PROJECT.md"]);
    assert.ok(
      planned.conflicts.some((c) => c.path === "AGENTS.md"),
      "approving one path must not approve the other",
    );

    await apply(dir, planned);
    assert.notEqual(await readFile(path.join(dir, "PROJECT.md"), "utf8"), "# owner content\n");
    assert.equal(await readFile(path.join(dir, "AGENTS.md"), "utf8"), "# owner content\n");
  });
});

test("an overwrite is marked destructive in the plan, so a reader can see it before it happens", async () => {
  await scratch(async (dir) => {
    await writeFile(path.join(dir, "PROJECT.md"), "# owner content\n", "utf8");
    const planned = await plan(dir, { overwrite: ["PROJECT.md"] });
    const action = planned.actions.find((a) => a.path === "PROJECT.md");
    assert.equal(action.action, "overwrite");
    assert.equal(action.destructive, true);
  });
});

test("creating a directory beside existing contents is safe and does not disturb them", async () => {
  await scratch(async (dir) => {
    await mkdir(path.join(dir, "analyses"));
    await writeFile(path.join(dir, "analyses", "existing.md"), "# an analysis\n", "utf8");
    await apply(dir, await plan(dir));
    assert.ok(existsSync(path.join(dir, "analyses", "existing.md")), "existing analyses must survive");
  });
});

// --- Mode routing ----------------------------------------------------------------------------------

test("a project with analyses and no policy is routed to audit before anything is recorded", async () => {
  // The dangerous direction. Scaffolding a policy beside unexamined analyses produces a repository
  // that appears governed while nothing in it has been checked.
  const planned = await scratch(
    (dir) => plan(dir),
    async (dir) => {
      await mkdir(path.join(dir, "analyses"));
      await writeFile(path.join(dir, "analyses", "retirement.md"), "# A projection\n", "utf8");
    },
  );
  assert.equal(planned.mode, MODES.UNAUDITED_ANALYSES);
  assert.equal(planned.auditRequired, true);
  assert.match(planned.nextStep, /standards audit/);
  assert.match(planned.nextStep, /never been evaluated/);
});

test("a governed project is told to reconcile its policy, not to replace it", async () => {
  const planned = await scratch(
    (dir) => plan(dir),
    async (dir) => {
      await mkdir(path.join(dir, "analyses"));
      await writeFile(path.join(dir, "analyses", "retirement.md"), "# A projection\n", "utf8");
      await writeFile(path.join(dir, "project-policy.yml"), 'standardVersion: "0.1.0"\n', "utf8");
    },
  );
  assert.equal(planned.mode, MODES.GOVERNED);
  assert.match(planned.nextStep, /Do not replace the existing policy/);
});

test("the rendering of an unaudited project says unevaluated is a distinct state from compliant", async () => {
  const planned = await scratch(
    (dir) => plan(dir),
    async (dir) => {
      await mkdir(path.join(dir, "analyses"));
      await writeFile(path.join(dir, "analyses", "a.md"), "# A projection\n", "utf8");
    },
  );
  const text = render(planned, { dryRun: true });
  assert.match(text, /NOT_EVALUATED, which is a distinct state from compliant/);
});

// --- What init scaffolds actually works --------------------------------------------------------------

test("the scaffolded policy validates against the framework's own schema", async () => {
  const { checkPolicy } = await import("../scripts/policy.mjs");
  const result = await checkPolicy(
    path.join(ROOT, "templates/project-policy.yml"),
    path.join(ROOT, "schemas/project-policy.schema.json"),
    "2026-08-09",
  );
  assert.equal(result.status, "ok", JSON.stringify(result.errors));
});

/**
 * Read a template with its line wrapping collapsed.
 *
 * Every document here is hard-wrapped at about 100 columns, so a phrase a test looks for is as
 * likely as not to straddle a newline — which is precisely the defect that made `fidelity.mjs`
 * silently skip claims, reappearing one layer up in the tests. Normalising once is the fix; writing
 * `\s+` into every pattern by hand is the same bug waiting for the next author who forgets.
 */
const flowed = async (file) => (await readFile(path.join(ROOT, file), "utf8")).replace(/\s+/g, " ");

test("the analysis template names both markers a document needs", async () => {
  const text = await flowed("templates/analysis-template.md");
  assert.match(text, /\[requires current external data\]/);
  assert.match(text, /\[requires personal financial context\]/);
});

test("the agent template tells an operator to stop rather than route around an invariant", async () => {
  const text = await flowed("templates/AGENTS.md");
  assert.match(text, /BLOCKED_BY_INVARIANT/);
  assert.match(text, /Stop and report it/);
  assert.match(text, /never required to reach a positive recommendation/i);
  assert.match(text, /the standard governs and this file is the defect/);
});

test("the agent template states that not-evaluated is never a pass", async () => {
  const text = await flowed("templates/AGENTS.md");
  assert.match(text, /This is never a pass/);
});

test("AGENTS.md and CLAUDE.md do not diverge", async () => {
  // Different tools read each, and duplicated guidance that drifts is worse than none.
  // `\r?\n` rather than `\n`: this repository pins no line endings, so a checkout on a machine with
  // core.autocrlf=true writes CRLF, the blank lines left by a stripped comment survive as `\r\n`,
  // and the two files differ by whitespace nobody wrote. The result was a test that passed or failed
  // according to how the working copy was created rather than what the templates say — and the
  // container inherits it, because the image is built from the working tree rather than from a
  // committed archive. The comparison itself is untouched.
  const strip = (s) => s.replace(/<!--[\s\S]*?-->(\r?\n)*/g, "").trim();
  const agents = strip(await readFile(path.join(ROOT, "templates/AGENTS.md"), "utf8"));
  const claude = strip(await readFile(path.join(ROOT, "templates/CLAUDE.md"), "utf8"));
  assert.equal(agents, claude);
});
