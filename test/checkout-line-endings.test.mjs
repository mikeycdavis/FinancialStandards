/**
 * The checkout line-ending invariant.
 *
 * THE GUARANTEE:
 *
 *     A FinancialStandards checkout must not let the cloning machine's `core.autocrlf` decide the
 *     bytes of tracked text files. Repository-declared attributes determine checkout line endings,
 *     with explicit exceptions only where this repository has evidence they are required.
 *
 * This is a checkout invariant. It is not a formatting preference and not a history
 * renormalisation: every committed blob here is already LF. What is wrong is what lands on disk.
 *
 * WHAT WAS MEASURED, on `main` at 3627c6f, in a freshly created worktree no editor had touched:
 *
 *     201 tracked files      i/lf  w/crlf        every single one
 *       0 committed blobs    i/crlf              history is clean
 *       0 files              declared            .gitattributes did not exist
 *
 * So a fresh clone on a Windows machine rewrites 100% of this repository's tracked text, and
 * nothing in the repository says otherwise.
 *
 * WHY THE BYTE CHECK IS LOAD-BEARING HERE, AND WAS NOT IN StandardsEnforcer.
 *
 * The sibling repository's pipeline builds its container from `git archive`, which emits committed
 * blob content — always LF — so a byte-level assertion there can never see a checkout defect and a
 * test that relied on it would be decorative. THIS repository's pipeline is shaped differently:
 *
 *     Dockerfile.ci:22   "The source is COPYed, not bind-mounted"
 *     Dockerfile.ci:27   COPY --chown=node:node . /repo
 *     compose.ci.yml:17  context: .
 *     .dockerignore      excludes .git ("nothing in the pipeline shells out to git")
 *
 * The build context is the working tree, so the container receives the developer's actual bytes,
 * CRLF included — while `.git` is deliberately absent. That splits the two halves of the guarantee
 * across two instruments, and each has an environment where it is the only one that can fire:
 *
 *     environment       .git   bytes on disk   declaration check   byte check
 *     Windows host      yes    CRLF            runs                runs
 *     Docker CI         no     CRLF (copied)   named skip          runs   ← only witness here
 *     hosted Linux      yes    LF              runs   ← only witness here     passes
 *
 * A skipped assertion is reported as skipped and is never a pass. `fatal: not a git repository` is
 * never allowed to count as a falsification: the git-dependent checks detect the absence and skip
 * with a reason rather than erroring.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Whether the git metadata the declaration lives in is readable from here. */
function repositoryIsReadable() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * A row of `git ls-files --eol`:  `i/lf<TAB-ish>w/crlf  attr/text=auto  <TAB>path`
 * The attribute field can contain spaces, so the tab before the path is the only safe split.
 */
function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "--eol"], { cwd: ROOT, encoding: "utf8" });
  return out
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const tab = line.indexOf("\t");
      const fields = line.slice(0, tab).trim().split(/\s+/u);
      return {
        index: fields[0].replace(/^i\//u, ""),
        worktree: fields[1].replace(/^w\//u, ""),
        attr: fields.slice(2).join(" ").replace(/^attr\//u, "").trim(),
        file: line.slice(tab + 1).trim(),
      };
    });
}

/** What this repository declares for a file. `-text` disables translation and is itself a decision. */
function declaredEol(attr) {
  if (attr === "") return "undeclared";
  if (/(^|\s)-text(\s|$)/u.test(attr)) return "untranslated";
  if (/eol=crlf/u.test(attr)) return "crlf";
  if (/eol=lf/u.test(attr)) return "lf";
  if (/(^|\s)text(=auto)?(\s|$)/u.test(attr)) return "lf";
  return "undeclared";
}

/**
 * Paths this repository declares as NOT LF. Deliberately empty: the measurement found no tracked
 * binary content (git detects that itself via `text=auto`), and no path with evidence that it needs
 * CRLF. The sibling repository's `*.ps1`, `*.svg` and fixture rules are NOT imported here — an
 * exception must be earned by this repository's own evidence, and none was. If one is ever added to
 * `.gitattributes`, add it here with the reason, and the two must be read together.
 */
const NOT_LF_BY_DECLARATION = [];

/** Not part of the checkout's declared content. */
const NOT_CONTENT = new Set([".git", "node_modules"]);

function walk(dir, rel = "") {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (NOT_CONTENT.has(entry.name)) continue;
    const relPath = rel === "" ? entry.name : `${rel}/${entry.name}`;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (relPath === "artifacts/local-ci") continue; // pipeline output, not commit content
      found.push(...walk(path.join(dir, entry.name), relPath));
    } else if (entry.isFile()) {
      found.push(relPath);
    }
  }
  return found;
}

const exemptFromLf = (rel) => NOT_LF_BY_DECLARATION.some((r) => rel.endsWith(r) || rel.startsWith(r));

/** The same heuristic git uses to decide a file is not text. */
const looksBinary = (buf) => buf.includes(0);

test("line endings · every tracked file's translation is declared, not left to the machine", (t) => {
  if (!repositoryIsReadable()) {
    t.skip(
      "no git metadata here — .dockerignore excludes .git from the CI image on purpose, so the " +
        "declaration cannot be read in the container. The byte-level check still runs, and here it " +
        "is load-bearing: this image is built by COPYing the working tree.",
    );
    return;
  }

  const undeclared = trackedFiles().filter((f) => declaredEol(f.attr) === "undeclared");

  assert.deepEqual(
    undeclared.map((f) => f.file),
    [],
    `${undeclared.length} tracked file(s) have no line-ending attribute, so what lands on disk is ` +
      `decided by each machine's core.autocrlf rather than by this repository. A fresh checkout on ` +
      `Windows rewrites every one of them.`,
  );
});

test("line endings · the working tree materialises what was declared", (t) => {
  if (!repositoryIsReadable()) {
    t.skip("no git metadata here — see the note on the previous test.");
    return;
  }

  const wrong = trackedFiles().filter((f) => {
    const declared = declaredEol(f.attr);
    if (declared === "undeclared" || declared === "untranslated") return false;
    if (f.worktree === "none") return false; // no line terminator at all; nothing was translated
    return f.worktree !== declared;
  });

  assert.deepEqual(
    wrong.map((f) => `${f.file} (declared ${declaredEol(f.attr)}, on disk ${f.worktree})`),
    [],
    "a declared line ending the checkout does not honour is a declaration in name only",
  );
});

test("line endings · no committed blob carries CRLF", (t) => {
  if (!repositoryIsReadable()) {
    t.skip("no git metadata here — the byte-level check covers what this image was given.");
    return;
  }

  // Guards the remedy from being applied in the wrong direction. The fix for a CRLF working tree is
  // a declaration, never writing CRLF into history — and with `eol=lf` in place, a CRLF blob would
  // still check out as LF, so the assertions above could not see it.
  const stored = trackedFiles().filter((f) => f.index === "crlf");
  assert.deepEqual(stored.map((f) => f.file), [], "committed blobs must be LF");
});

test("line endings · nothing on disk carries CRLF except where this repository declares it", () => {
  // Needs no git metadata, so it runs inside the container — where the copied working tree means it
  // is the only assertion that can witness the defect.
  const offenders = [];
  for (const rel of walk(ROOT)) {
    if (exemptFromLf(rel)) continue;
    let buf;
    try {
      buf = fs.readFileSync(path.join(ROOT, rel));
    } catch {
      continue;
    }
    if (looksBinary(buf)) continue;
    if (buf.includes("\r\n")) offenders.push(rel);
  }

  assert.deepEqual(
    offenders.slice(0, 40),
    [],
    `${offenders.length} file(s) carry CRLF on disk without this repository declaring it. ` +
      `Adding the declaration does not rewrite a checkout that already exists — refresh one with ` +
      `\`git rm --cached -r . && git reset --hard\`.`,
  );
});

test("line endings · the release digests pin untracked material, so this declaration cannot move them", (t) => {
  // NEIGHBOUR PIN. `artifacts/**/retrieved.sha256` records a sha256 over a `retrieved.md` that is
  // deliberately NOT committed (each directory's own .gitignore excludes it). Attributes apply to
  // tracked content, so a line-ending declaration cannot change what those digests are computed
  // over. This test exists so that stops being an assumption: if `retrieved.md` ever becomes
  // tracked, the declaration would start normalising it and the digest would move silently.
  const digestFiles = walk(ROOT).filter((rel) => rel.endsWith("retrieved.sha256"));
  assert.ok(digestFiles.length > 0, "expected the retrieved.sha256 records to exist");

  if (!repositoryIsReadable()) {
    t.skip("no git metadata here — whether a path is tracked cannot be answered in the container.");
    return;
  }

  const tracked = new Set(
    execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim()),
  );

  const nowTracked = digestFiles
    .map((rel) => `${path.posix.dirname(rel)}/retrieved.md`)
    .filter((rel) => tracked.has(rel));

  assert.deepEqual(
    nowTracked,
    [],
    "a digested retrieved.md became tracked, so the line-ending declaration now applies to it and " +
      "its recorded sha256 no longer describes the bytes on disk. Re-derive the digest deliberately.",
  );
});
