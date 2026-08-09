# Standard 29 — Standards Integrity

Every other standard in this series governs what an analysis must do. This one governs what may be
done to the standards themselves, and it exists because the cheapest way to pass any check is to
change the check.

Source: the `Standards integrity invariant` section of
[`standalone-system-directive.md`](../artifacts/prompts/standalone-system-directive.md). Reproduced
verbatim from the source:

```text
A human or AI must never bypass, weaken, remove, reclassify, reinterpret, falsify evidence for, or manipulate a standard, test, applicability determination, evidence requirement, or verification mechanism solely because it prevents the desired implementation or conclusion.
```

The same source requires that an operator be able to, verbatim from the source:

```text
refuse or stop work that would violate an invariant
```

## Scope

Applies to every person and every agent working in this repository or in any project that adopts it.
Its subject is not an analysis document — it is the framework: the standards, the rule catalog, the
detectors, the guards, the tests, the schema, the policy, and every applicability and evidence
determination recorded anywhere.

It applies with equal force to the two directions the pressure comes from. A person under deadline
who widens a tolerance to make a build green, and an agent instructed to "make the check pass", are
doing the same thing.

## Requirements

### R1 — The invariant binds absolutely, and the word that carries it is *solely*

No standard, test, applicability determination, evidence requirement, or verification mechanism may be
bypassed, weakened, removed, reclassified, reinterpreted, falsified, or manipulated **solely because
it prevents a desired implementation or conclusion**.

That qualifier is what makes the invariant usable rather than paralysing. Standards are wrong
sometimes; detectors have bugs; a tolerance genuinely can be too tight. Changing one of those is
ordinary work. What the invariant forbids is changing it *because it is in the way* — where the
reason for the change is the inconvenience rather than a defect in the thing changed.

The practical test is whether the change would still be correct if the blocked outcome were not
wanted. A tolerance widened because the underlying function rounds differently than the prose is a
fix. The same tolerance widened by the same amount because a number did not match is a violation, and
the two are indistinguishable in the diff. This is why R4 requires the reason to be recorded rather
than inferred.

### R2 — Discovering the conflict REQUIRES stopping, not routing around

An agent or person who finds that completing a task would require violating R1 MUST stop and report
it. They MUST NOT complete the task by a route that avoids the check, and MUST NOT present the work
as done.

The reportable conclusion is `BLOCKED_BY_INVARIANT`
([ADR 0006](../artifacts/adr/0006-blocked-by-invariant-verdict.md)), which outranks every other
verdict and is reachable without a policy — because a non-exemptible rule does not need one to apply.

This is deliberately a *conclusion* rather than an error. An agent that can only crash has not
refused; it has failed, and failing looks like something to fix. An agent that can return
`BLOCKED_BY_INVARIANT` has given a complete answer, and
[Standard 1](01-modes-of-financial-communication.md) R5 establishes that such an answer is never a
failure to produce a positive recommendation.

### R3 — Weakening is not always deletion

The invariant names seven verbs, and only two of them look like removal. The forms this most often
takes in practice:

| Form | What it looks like |
| --- | --- |
| Reclassify | A `required` rule becomes `recommended`; a `forbidden` rule becomes `optional` |
| Reinterpret | A quoted prohibition is reworded — `never describe` becomes `avoid describing` |
| Bypass | A path is added to a skip list; a fixture is excluded by name rather than by mechanism |
| Falsify evidence | An attestation is recorded without the review it claims; a digest is copied rather than computed |
| Manipulate | A tolerance is widened to fit; a detector's pattern is narrowed until it stops matching |
| Weaken | A test's assertion is loosened; a known-positive fixture is edited until it passes |
| Remove | A guard is deleted, a CI step commented out, a test skipped |

Each of these leaves the framework looking intact. That is what makes them worth naming: nobody
announces that they are weakening a standard.

### R4 — A legitimate change to a standard records why

Changing a standard, rule, detector, or test is permitted and expected. What R1 requires is that the
change be made for a reason that would hold anyway.

So any change to a standard's requirements, a rule's level or severity, a detector's pattern, or a
test's assertion MUST record its reason — in the commit message, and in a decision record where the
change alters a contract. Where the change happens to unblock something, the record MUST say so, so a
reviewer can weigh the coincidence rather than discover it.

A rule that is genuinely wrong should be changed. A rule that is merely inconvenient should not. The
record is what lets a future reader tell which happened.

### R5 — The invariant's protections MUST themselves be tested

Every mechanical guard listed below MUST have a test that fails if the guard is removed or defeated,
and those tests are themselves covered by R1. A guard with no test is an honour system; a test that
would pass with the guard deleted is decoration.

## How this invariant is protected

The source directive asks how the invariant can itself be protected and tested. This section is the
answer, and it distinguishes what is mechanical from what is not — because claiming more would be its
own violation.

### Mechanical guards

| Guard | What it makes impossible to do quietly |
| --- | --- |
| `npm run inventory` | Deleting or rewording a source bullet. The 23 prohibitions' exact text is recorded in the frozen inventory; softening one fails the build. |
| `npm run fidelity` | Rewording a quoted requirement while still claiming it is verbatim. |
| `npm run links` | Removing a standard that other documents cite, leaving references that read as withdrawn requirements. |
| `npm run math` | Adjusting a figure or a tolerance so a document's arithmetic agrees with itself when it does not. |
| Schema `propertyNames` | Introducing a second spelling of a rule id, so one rule quietly becomes two and a policy governs only one of them. |
| `assertBindings` | An evaluator reporting against an id the catalog does not define, growing a private vocabulary the policy cannot reach. |
| Non-exemptible enforcement | Waiving an absolute prohibition. The waiver is rejected, not ignored, and the verdict becomes `BLOCKED_BY_INVARIANT`. |
| Attestation contradiction | Recording a human approval that overrides an automated finding. Evidence outranks assertion. |
| Attestation digests | Letting a review go stale silently. When the reviewed content changes, the attestation lapses on its own. |
| CI step ordering | Rendering a verdict from unverified inputs. Guards run before `check`. |
| No install step in CI | Adding a dependency. The rule is structural rather than documented. |

### Self-protection tests

`test/integrity.test.mjs` asserts, and fails if any becomes untrue:

- the set of non-exemptible rule ids is **exactly** the five expected — removing a flag fails a test
  rather than quietly widening what may be waived;
- `integrity.no-weakening` exists, is `forbidden`, and is non-exemptible;
- every prohibition in the source's must-never list has a corresponding `forbidden` rule;
- the `level`, `severity`, `validationType`, and `assurance` enumerations are unchanged, so widening
  one is an edit to a test rather than a side effect;
- the CI workflow still contains every guard step, so commenting one out fails the build it was
  commented out of;
- no rule claims `assurance: "full"` without a checker that evaluates it.

### What is not protected, stated plainly

**Deleting the guards and their tests together cannot be prevented from inside this repository.**
Nothing here can stop someone with commit access from removing `test/integrity.test.mjs`,
`scripts/fidelity.mjs`, and the CI steps in one change, and the result would be a repository that
looks clean and checks nothing.

The backstops are outside the code: git history makes the change visible, and review makes it
answerable. This standard forbids it normatively and cannot enforce that prohibition. Saying so is
required — a system that claimed self-protection it does not have would be making exactly the kind of
overclaim that [Standard 26](26-evidence-and-provenance.md) forbids about evidence.

Two lesser gaps, also stated rather than discovered:

- The guards detect *mechanical* weakening. A standard rewritten wholesale, with its quotations
  intact and its requirements gutted, passes every check in the table above.
- `integrity.no-weakening` is `manual-review` with `assurance: "none"`. It was briefly written as
  `partial`, on the reasoning that the guard suite catches the mechanical forms — and that reasoning
  is wrong in a way worth recording, because it is the framework's own characteristic error. The
  guards' coverage already belongs to `integrity.guards-present`, which claims full assurance for
  exactly it. Crediting this rule as well would count the same coverage twice and overstate what
  *this* check establishes, which is nothing: its evaluator is a human, and an automated run says
  nothing about it.

## Additions this standard makes beyond the source

The source states the invariant in one sentence and asks how it can be protected and tested.
Everything else here is authored:

- **R1's reading of *solely* as the load-bearing word**, and the practical test of whether the change
  would still be correct if the blocked outcome were not wanted.
- **R2's stop-work contract** and its insistence that this is a conclusion rather than an error. The
  source requires the capability; the framing is this document's.
- **R3's table of forms.** The source names seven verbs; the worked examples of what each looks like
  in this repository are authored.
- **R4 in full.** The source does not address legitimate change.
- **R5 and the entire protection section.** The source asks the question; this is the answer,
  including the admission of what is not protected.

## Relationship to other standards

[Standard 25](25-prohibitions.md) carries the domain prohibitions; this one protects them from being
edited into compliance. [Standard 26](26-evidence-and-provenance.md) governs the attestation
mechanism whose falsification R3 names. [Standard 1](01-modes-of-financial-communication.md) R5
establishes that refusing is a complete output, which is what makes R2's stop possible without it
reading as failure.

The four non-exemptible prohibitions in Standard 25 and `integrity.no-weakening` here are the five
rules that produce `BLOCKED_BY_INVARIANT`.

## Implementation

**Automated, full assurance — one rule.** `integrity.guards-present` checks that every guard in the
table above is wired into CI and that its script exists. This is structural and exact: a commented-out
step or a deleted script is detected.

**Automated, partial assurance — one rule.** `integrity.no-silent-reclassification` checks that no
rule id has disappeared and no deprecation lacks its lifecycle fields, so a rule cannot be removed
without leaving a resolvable trace.

**Not automated — the invariant itself.** `integrity.no-weakening` is `manual-review`. Whether a
change was made *solely* because a standard was in the way is a question about why someone did
something, and no checker reads intent. It reports `NOT_EVALUATED` unless a reviewer records a
judgement against specific paths with a digest, and that attestation lapses on its own when those
paths change.

This is the honest position: the mechanical forms of weakening are caught, the motivated ones are not,
and the difference is disclosed rather than papered over with a rule that claims more than it can
establish.
