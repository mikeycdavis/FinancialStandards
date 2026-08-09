---
name: crypto-oof-live-divergence
description: "RESOLVED (2026-07-25): crypto bleed ENDED — 6 of 7 slots flipped positive over rounds 1304-1314; meta-orth arms lead; production orniferous is now the only negative slot and 5 slots pass the paired promotion gate. Earlier CROWDING diagnosis retained below."
metadata: 
  node_type: memory
  type: project
  originSessionId: 942e01dd-2be9-4f8e-a190-bdd5eacf1527
  modified: 2026-08-05T00:41:21.011Z
---

> **2026-08-04 — DROPOUT QUANTIFIED. It WAS chronic, but it does NOT explain
> the divergence, and it cannot be measured from the data we have.**
>
> *Chronic and deterministic, not sporadic.* Numerai crypto eras are
> **weekdays only** (0 Saturday, 0 Sunday across 1,697 train eras) and
> `live.parquet` carries the previous era. YIEDL publishes **every calendar
> day** and `yiedl_latest` retains only the 2–3 most recent days. So on a
> MONDAY run the live era is the preceding FRIDAY — three calendar days back,
> and never inside a {Sat, Sun, Mon} window. The old exact join therefore
> matched **nothing on every Monday run**, by construction.
>
> Cross-referencing `logs/crypto_history.log` (which accumulates, unlike the
> overwritten run logs) against round open/close times identifies **9
> Monday-submitted rounds**: 1259, 1274, 1279, 1284, 1294, 1304, 1314, 1319,
> **1324**. The method independently recovers 1324 — the known 08-03 incident
> — which validates it. That is ~19% of post-YIEDL submissions.
>
> *But it is NOT the cause of the sustained negative MMC.* Broken-join rounds
> averaged MMC **−0.0382**; healthy Tue–Fri rounds averaged **−0.0405**. The
> rounds with FULL coverage were just as negative. Difference +0.0024,
> p=0.914.
>
> *And the test cannot settle it either way.* With 8 scored broken rounds vs
> 38 healthy and pooled sd 0.056, the minimum detectable effect at 80% power
> is **0.061 MMC** — three times the −0.0195 mean MMC across all rounds. This
> is an UNDERPOWERED NULL, not evidence of no effect. Do not cite the p-value
> as exoneration.
>
> **Net for the crowding diagnosis:** it is neither retired nor confirmed. The
> dropout cannot be the primary driver (full-coverage rounds bled equally), so
> crowding survives as the best available explanation — but it was reached
> without controlling for a defect affecting 1 round in 5, so treat it as
> unproven rather than settled.
>
> **Fixed going forward:** `merge_yiedl_asof` (PR #147) resolves Monday runs
> from the historical archive. Verified live on 2026-08-04: 91.3% coverage,
> newest YIEDL row 0 days behind the live era.
>
> **Measurement gap — CLOSED (PR #151, merged 2026-08-05, `8756b5c`).** Crypto
> coverage used to reach only `logs/crypto_train.log`, which is OVERWRITTEN
> every run, so no history existed and none would have accumulated — which is
> why the above had to be inferred structurally rather than measured.
> `crypto_coverage_log.csv` now appends one row per run (coverage, row counts,
> as-of date span, and the per-symbol staleness profile) and carries the round
> number, so it joins to `performance_log.csv`. It is VERSIONED via a
> .gitignore exception (same precedent as slot_config_history.csv) — ignoring
> it would strand the history on one machine. `merge_yiedl_asof` also now
> warns when a SUBSET of symbols is stale while the feed itself is current;
> judging by `used.max()` alone hid the 2026-08-04 case where the newest row
> was 0d behind live and the oldest was from 2019.
>
> **The log starts empty**: it makes the question answerable from round ~1326
> onward but recovers nothing about 1259–1324. Those remain answerable only by
> the structural argument above, which is now written into
> `artifacts/05-crypto-yiedl-dataflow.md` rather than living in a transcript.
>
> ---
>
> **2026-08-03 — LIVE YIEDL FEATURE DROPOUT FOUND. This may REOPEN the whole
> divergence question below.** On the 08-03 run, ALL 3,669 YIEDL features were
> NaN for every live row: crypto `live.parquet` is dated 2026-07-31 while
> `yiedl_latest.parquet` holds only 2026-08-01/08-02, and `merge_yiedl` joins on
> exact `(date, symbol)` — so it matched 0 of 1,100,700 cells (verified by
> replaying the merge). Consequences: `ornysentijr` (sentiment-only) got 100%
> NaN → `nan_to_num` zeros → constant prediction → all 0.5 → REJECTED by the API
> ("submission must have non-zero standard deviation"). The other 6 slots
> submitted FINE but were degraded — trained on 3,691 features, predicting from
> 22 tournament features + 3,669 zeros. Nothing detected this; zeroed features
> still yield varied predictions, so 6 bad submissions were accepted silently.
>
> **Why this matters for the diagnosis below:** "excellent OOF / terrible live"
> is exactly what live feature dropout produces, and the 2026-07 investigation
> never checked live feature coverage — it tested stale weights (refuted) and
> leakage (refuted), then settled on CROWDING. Do NOT treat the crowding
> conclusion as safe until live YIEDL coverage is checked across past rounds.
>
> Fix shipped in two parts: (1) DETECTION — **PR #146 (540fe8c, merged)** prints
> live YIEDL coverage every run and aborts below 5% before any CSV is written,
> with `ALLOW_MISSING_YIEDL=1` as the escape hatch; (2) ROBUSTNESS —
> `merge_yiedl_asof` in utils/yiedl.py gives each symbol its newest YIEDL row
> dated <= the live era, sourced from latest ∪ historical, with post-live rows
> discarded so there is no lookahead. Measured on the real 08-03 files: exact
> join 0.0% coverage → as-of join **92.7%**, using YIEDL date 07-31 (0 days
> behind live). Train/validation keep the exact join — only LIVE changed. An exact-date join between two
> independently-published feeds, where `yiedl_latest` holds only ~2 days, has
> almost no tolerance for skew. NOTE `yiedl_historical.parquet` is a
> ZIP64/STORED archive despite the extension (load_yiedl handles it) — plain
> `pq.ParquetFile()` fails with "magic bytes not found"; that is NOT corruption.
>
> **STATUS UPDATE 2026-07-25 — THE BLEED IS OVER.** Over the 11 resolved rounds
> since 1304, 6 of 7 crypto slots went from negative to strongly positive mean
> payout (MMC-only): ornyfleezjr −0.0405→+0.0453 (Sharpe −0.45→+1.98),
> ornycheezjr −0.0448→+0.0408 (−0.51→+2.28), ornyjacksonjr −0.0221→+0.0294,
> ornysneezjr −0.0497→+0.0275, ornyqueezjr −0.0382→+0.0240, ornysentijr
> −0.0376→+0.0235 (no longer the worst slot). Crypto now beats the LB median on
> both corr20v2 (+0.0669) and mmc (+0.0071).
>
> **Attribution: NOT our code.** No crypto change landed at round 1304 — configs
> were frozen at 1289 and D2 was deferred entirely. The flip is regime /
> meta-model composition. But it *vindicates the crowding diagnosis's
> recommendation*: the two meta-orthogonalization arms are now the top two slots
> by mean payout, exactly the predicted lever.
>
> **Production `orniferous` (prop=0.75, top_k=50) is now the WORST slot** —
> −0.0208→−0.0120 (Sharpe −0.73), the only one still negative. 5 slots clear the
> paired 2×SE gate against it (n=20), ornyfleezjr leading at diff +0.0377;
> promote_best_slot shows `[PENDING]` → re-run after the next resolved round to
> confirm hysteresis, then promote. **The stake de-risk recommendation below is
> now INVERTED** — crypto is currently the healthiest of the three books.
>
> **STATUS: CLOSED 2026-07-03** — diagnosis is CROWDING (see "CLOSING DIAGNOSIS"
> below), not a bug/leak/stale-weights (both leading hypotheses refuted by the
> evidence run). Two items remain OPEN and manual: (1) the stake de-risk decision,
> (2) watching the meta-orthogonalization arms (ornyfleezjr/ornycheezjr). The
> hypothesis narrative below is kept for the reasoning trail.

## Investigation (opened 2026-07-01)

Crypto is bleeding on every slot. At round 1301 all 7 crypto slots have deeply
**negative** live 20R payout Sharpe (−0.87 to −1.8) and we trail the LB badly
(our corr20v2 +0.0074 vs LB median +0.069; mmc **−0.052** vs +0.022). Yet crypto
**OOF Sharpe is strongly positive** (`crypto_training_diagnostics.json`:
target_binned_return_20 = 1.47, target_binned_return_60 = 1.65). Great OOF /
terrible live ⇒ a modeling-assumption problem, **not a code bug**.

**Leading hypothesis (verify before acting):** the ensemble weights are computed
from **full-history** OOF Sharpe (`phases/phase4/crypto/train-crypto.py` ~L739-741,
`raw_weights = max(0, oof_corrs[t])`), but crypto is high-regime-drift. The code
already restricts its *MMC proxy* to the last 252 eras ("live-relevant regime",
~L789-791) yet the *actual ensemble weights* still use the whole ~4.5y history.
No `validation.parquet` exists for crypto/v2.0 to catch this before deploy.

**Top verification step:** recompute OOF Sharpe on only the last ~252 eras and
compare to the full-history value used for weighting. If recent-era Sharpe is weak
or negative, that's the root cause. Secondary: check the multi-target covered-mask
intersection (~L775-776) for recency bias; confirm the MMC proxy sweep actually ran
(fresh-train only, not cache hits).

## D1 instrumentation LANDED (2026-07-03, PR #128)

`recent_era_sharpe()` in utils/training.py + train-crypto.py now prints
full-vs-recent OOF Sharpe (last 252 covered eras, matching the MMC-proxy window)
plus WOULD-BE recent-window ensemble weights on every run, persists
`oof_corrs_recent` in the model cache, and writes `oof_sharpe_recent` /
`ensemble_weights_recent` into crypto_training_diagnostics.json.
**Diagnostic-only — weights still full-history.**

## EVIDENCE RUN RESULT (2026-07-03 fresh train) — X1 hypothesis REFUTED

Full vs last-252-era OOF Sharpe: target_20 1.463→1.346, target_60 1.633→1.779,
sentiment 0.644→0.613. Weights would barely move (0.473/0.527 → 0.431/0.569).
**Recent-regime OOF is just as positive as full-history** ⇒ stale weighting is
NOT the divergence's root cause; the D2b weight switch would be a near-no-op.

**Revised reading:** (a) OOF Sharpe measures CORRELATION, but crypto pays
MMC-ONLY — live corr is actually positive (+0.0074) while live MMC is −0.05:
the model isn't broken, it's CROWDED OUT (meta-model already has our signal).
(b) The OOF numbers may still be inflated by the verifier-confirmed leakage
geometry (ES holdout inside the label horizon + 1.1× purge factor
under-covering trading-day labels) — fixing that (D2a) should make OOF honest
(expect it to drop), but won't by itself fix live MMC. Most promising levers:
meta-orthogonalization arms (ornyfleezjr/ornycheezjr — watch them) and stake
de-risking.

## D2 DEFERRED ENTIRELY (2026-07-03, user decision after evidence review)

- **D2b (recent-window weights): REFUTED** by the evidence run — recent-regime
  OOF is as positive as full-history; weights barely move. Not applied.
- **D2a (ES-holdout/purge "leak" fix): REFUTED on re-derivation** — the audit's
  overlap arithmetic assumed 20 TRADING-day labels (~28 calendar days), but
  crypto trades 24/7 → calendar-day labels, which the 22/66-era purges (1.1×
  margin) fully cover; ES purge-band rows are excluded from both train and
  eval, so they cannot leak. Only residual value was a wider (stabler) ES
  holdout — a quality tweak not worth a retrain + 7-slot history restart on a
  bleeding book. Not applied.

## CLOSING DIAGNOSIS: crowding, not leakage or stale weights

Live corr is POSITIVE (+0.0074) while live MMC is −0.05 and crypto pays
MMC-only: the model works, the meta-model already contains its signal.
Next levers, in order: (1) watch the meta-orthogonalization arms
(ornyfleezjr meta_orth=1.0, ornycheezjr 0.5) — they attack crowding directly;
(2) the stake de-risk decision (manual, below); (3) signal diversity
(ornysentijr disjoint sentiment model — currently the WORST slot, so sentiment
alone isn't the answer either). The lesson for the analysis loop: OOF Sharpe
measures correlation and can NEVER predict MMC — only orthogonality metrics
(mmc_proxy class) can, and those need live calibration.

**Also review:** the sentiment slot `ornysentijr` is the *worst* slot (−1.82) — the
2026-06 sentiment run (YIEDL sentiment block unlocked, 1596 sentiment_* cols) looks
net-harmful live; confirm against the fresh crypto run log. See the crypto flag
notes and `assert_unique_configs` in train-crypto.py.

## Staged-but-NOT-applied lever

`tune_neutralization` favors crypto prop 0.75 → 0.0 (`ornyjacksonjr`, +0.0017
rolling payout — barely over threshold, still deeply negative). This is *mitigation*,
not a fix — the whole book is negative regardless. User chose **investigate first**;
do NOT flip `NEUTRALIZE_PROPORTION` in train-crypto.py until the divergence is
explained. Note that constant drives both `orniferous` (prod) and `ornysneezjr`.

## De-risk decision (manual, user action)

Recommended: reduce/pause crypto stake on the Numerai site until the divergence is
explained and a change demonstrably improves live results. Not a code change.

Related: [[analysis_loop]] · this round also promoted Signals janky 0.75→0.875
(see slot_config_history.csv / git; poo now holds the 0.75 anchor).
