/**
 * The financial mathematics.
 *
 * These are the only functions in the repository whose answers are right or wrong rather than
 * well-judged or ill-judged, which is why a rule that recomputes them can honestly claim full
 * assurance (ADR 0002). That claim rests entirely on this file: if these functions are wrong, every
 * calc block in every document verifies against the same wrong answer and the whole mechanism
 * reports clean.
 *
 * So the values below are checked against independently known results — standard textbook figures
 * and closed-form identities — not against what the implementation happens to produce.
 */

import test from "node:test";
import assert from "node:assert/strict";
import * as f from "../scripts/finance.mjs";

/** Compare to a fixed number of decimal places, since these are money and rate figures. */
const near = (actual, expected, places = 6) =>
  assert.equal(Number(actual.toFixed(places)), Number(expected.toFixed(places)));

// --- Growth and compounding -------------------------------------------------------------------

test("a lump sum compounds to its textbook value", () => {
  near(f.futureValue({ principal: 10000, annualRate: 0.05, years: 10 }), 16288.946268, 6);
});

test("monthly compounding beats annual at the same nominal rate", () => {
  const annual = f.futureValue({ principal: 10000, annualRate: 0.05, years: 10, compoundsPerYear: 1 });
  const monthly = f.futureValue({ principal: 10000, annualRate: 0.05, years: 10, compoundsPerYear: 12 });
  assert.ok(monthly > annual, "more frequent compounding produces more, at the same stated rate");
});

test("a zero rate leaves a lump sum unchanged", () => {
  near(f.futureValue({ principal: 10000, annualRate: 0, years: 30 }), 10000, 6);
});

test("a zero horizon leaves a lump sum unchanged", () => {
  near(f.futureValue({ principal: 10000, annualRate: 0.08, years: 0 }), 10000, 6);
});

test("a contribution stream at zero rate is just the sum of the contributions", () => {
  // The closed form divides by the rate, so zero is the case a naive implementation returns NaN for.
  near(f.futureValueWithContributions({ contribution: 100, annualRate: 0, years: 10 }), 12000, 6);
});

test("contributing at the start of each period beats contributing at the end", () => {
  const end = f.futureValueWithContributions({ contribution: 500, annualRate: 0.07, years: 30, timing: "end" });
  const begin = f.futureValueWithContributions({ contribution: 500, annualRate: 0.07, years: 30, timing: "begin" });
  assert.ok(begin > end, "an annuity due earns one extra period of growth on every contribution");
});

test("growth and its implied compound rate are inverses", () => {
  const end = f.futureValue({ principal: 10000, annualRate: 0.07, years: 12 });
  near(f.cagr({ beginValue: 10000, endValue: end, years: 12 }), 0.07, 10);
});

test("the effective annual rate exceeds the nominal rate whenever compounding is more frequent than annual", () => {
  near(f.effectiveAnnualRate({ nominalRate: 0.05, compoundsPerYear: 12 }), 0.051162, 6);
});

test("the effective annual rate equals the nominal rate when compounding is annual", () => {
  near(f.effectiveAnnualRate({ nominalRate: 0.05, compoundsPerYear: 1 }), 0.05, 10);
});

test("a return path produces the same value regardless of its order, when nothing is withdrawn", () => {
  const path = [0.1, -0.2, 0.15, 0.05];
  near(f.growthOfPath({ initial: 1000, returns: path }), f.growthOfPath({ initial: 1000, returns: [...path].reverse() }), 8);
});

// --- Real versus nominal ------------------------------------------------------------------------

test("the real rate follows the Fisher relation, not subtraction", () => {
  near(f.realRate({ nominalRate: 0.08, inflationRate: 0.03 }), 0.048544, 6);
});

test("the Fisher relation is always below the subtraction approximation, which is why the approximation flatters", () => {
  for (const [n, i] of [[0.08, 0.03], [0.12, 0.09], [0.05, 0.02], [0.3, 0.2]]) {
    assert.ok(f.realRate({ nominalRate: n, inflationRate: i }) < n - i, `at ${n}/${i}`);
  }
});

test("a nominal rate equal to inflation is a zero real return", () => {
  near(f.realRate({ nominalRate: 0.04, inflationRate: 0.04 }), 0, 12);
});

test("a nominal rate below inflation is a real loss", () => {
  assert.ok(f.realRate({ nominalRate: 0.02, inflationRate: 0.05 }) < 0);
});

test("purchasing power erodes to the textbook figure", () => {
  near(f.realValue({ nominalValue: 100000, inflationRate: 0.03, years: 30 }), 41198.676, 3);
});

test("zero inflation leaves purchasing power unchanged", () => {
  near(f.realValue({ nominalValue: 100000, inflationRate: 0, years: 30 }), 100000, 6);
});

// --- Debt --------------------------------------------------------------------------------------

test("a mortgage payment matches its textbook value", () => {
  near(f.amortizedPayment({ principal: 300000, annualRate: 0.06, years: 30 }), 1798.65, 2);
});

test("a zero-rate loan repays principal in equal instalments", () => {
  near(f.amortizedPayment({ principal: 12000, annualRate: 0, years: 1 }), 1000, 6);
});

test("the balance is zero after the final payment", () => {
  const args = { principal: 300000, annualRate: 0.06, years: 30, paymentsPerYear: 12 };
  near(f.amortizationBalance({ ...args, paymentsMade: 360 }), 0, 4);
});

test("the balance is the full principal before any payment", () => {
  const args = { principal: 300000, annualRate: 0.06, years: 30 };
  near(f.amortizationBalance({ ...args, paymentsMade: 0 }), 300000, 6);
});

test("total interest on a long mortgage exceeds the amount borrowed", () => {
  const interest = f.totalInterestPaid({ principal: 300000, annualRate: 0.06, years: 30 });
  near(interest, 347514.57, 2);
  assert.ok(interest > 300000, "the number borrowers most often have not seen");
});

test("a zero-rate loan costs no interest", () => {
  near(f.totalInterestPaid({ principal: 12000, annualRate: 0, years: 1 }), 0, 6);
});

// --- Fees, taxes, and the chain -----------------------------------------------------------------

test("a fee is applied multiplicatively, so the drag exceeds a plain subtraction", () => {
  const afterFee = f.afterFeeRate({ grossRate: 0.08, expenseRatio: 0.0075 });
  near(afterFee, 0.0719, 6);
  assert.ok(afterFee < 0.08 - 0.0075, "subtracting understates fee drag, always in the flattering direction");
});

test("a loss is not reduced by a tax on gains", () => {
  near(f.afterTaxRate({ rate: -0.1, taxRate: 0.3 }), -0.1, 10);
});

test("the full chain applies fees, then tax, then inflation", () => {
  near(f.netRealReturn({ grossRate: 0.08, expenseRatio: 0.0075, taxRate: 0.15, inflationRate: 0.03 }), 0.030209, 6);
});

test("the chain with no fees, tax, or inflation is the gross rate", () => {
  near(f.netRealReturn({ grossRate: 0.08 }), 0.08, 10);
});

test("a positive nominal return can still be a real loss once fees, tax, and inflation apply", () => {
  const net = f.netRealReturn({ grossRate: 0.04, expenseRatio: 0.0075, taxRate: 0.15, inflationRate: 0.045 });
  assert.ok(net < 0, "the case a nominal-only presentation hides");
  near(net, -0.016871, 6);
});

// --- Portfolio ------------------------------------------------------------------------------------

test("a weighted return is the weighted average of its components", () => {
  near(f.weightedReturn({ weights: [0.6, 0.4], returns: [0.1, -0.05] }), 0.04, 10);
});

test("weights that do not sum to one are refused, because that is not a portfolio", () => {
  assert.throws(() => f.weightedReturn({ weights: [0.6, 0.3], returns: [0.1, 0.1] }), RangeError);
});

test("an equal-weighted portfolio has effective holdings equal to its count", () => {
  const c = f.portfolioConcentration({ weights: [0.25, 0.25, 0.25, 0.25] });
  near(c.effectiveHoldings, 4, 8);
  near(c.maxWeight, 0.25, 8);
});

test("concentration distinguishes portfolios that share a largest position", () => {
  // Both have maxWeight 0.5; only the Herfindahl measure separates them, which is why both are
  // reported. A single number would call these equally concentrated.
  const twoWay = f.portfolioConcentration({ weights: [0.5, 0.5] });
  const spread = f.portfolioConcentration({ weights: [0.5, 0.1, 0.1, 0.1, 0.1, 0.1] });
  assert.equal(twoWay.maxWeight, spread.maxWeight);
  assert.ok(spread.effectiveHoldings > twoWay.effectiveHoldings);
});

test("a single holding is maximally concentrated", () => {
  const c = f.portfolioConcentration({ weights: [1] });
  near(c.herfindahl, 1, 10);
  near(c.effectiveHoldings, 1, 10);
});

// --- Dispersion and drawdown -----------------------------------------------------------------------

test("the geometric mean is never above the arithmetic mean, and the gap is volatility drag", () => {
  const returns = [0.5, -0.5];
  near(f.arithmeticMean({ returns }), 0, 10);
  near(f.geometricMean({ returns }), -0.133975, 6);
});

test("a constant return series has no gap between its two means", () => {
  const returns = [0.07, 0.07, 0.07];
  near(f.geometricMean({ returns }), f.arithmeticMean({ returns }), 10);
});

test("a total loss makes the geometric mean undefined rather than silently zero", () => {
  assert.throws(() => f.geometricMean({ returns: [0.1, -1] }), RangeError);
});

test("standard deviation of an unvarying series is zero", () => {
  near(f.stdev({ returns: [0.05, 0.05, 0.05] }), 0, 10);
});

test("the sample standard deviation exceeds the population figure on the same data", () => {
  const returns = [0.1, -0.05, 0.2, 0.0];
  assert.ok(f.stdev({ returns, sample: true }) > f.stdev({ returns, sample: false }));
});

test("a single observation has no sample standard deviation", () => {
  assert.throws(() => f.stdev({ returns: [0.05], sample: true }), RangeError);
});

test("maximum drawdown measures peak to trough, not first to last", () => {
  // Ends above where it started, and still had a 50% drawdown. Reporting only the ending value
  // would hide the decline an investor actually had to sit through.
  near(f.maxDrawdown({ values: [100, 120, 60, 90, 130] }), 0.5, 10);
});

test("a monotonically rising series has no drawdown", () => {
  near(f.maxDrawdown({ values: [100, 110, 120] }), 0, 10);
});

// --- Sequence risk -----------------------------------------------------------------------------------

test("the same returns in a different order produce different outcomes once money is being withdrawn", () => {
  const path = [-0.15, -0.1, 0.2, 0.15, 0.1, 0.12, 0.08, 0.14];
  const badFirst = f.sequenceOutcome({ initial: 100000, periodicWithdrawal: 8000, returns: path });
  const goodFirst = f.sequenceOutcome({ initial: 100000, periodicWithdrawal: 8000, returns: [...path].reverse() });
  assert.ok(
    goodFirst.endingBalance > badFirst.endingBalance,
    "this asymmetry IS sequence risk; with no withdrawals the two would be identical",
  );
  near(badFirst.endingBalance, 59414.044739, 4);
  near(goodFirst.endingBalance, 87679.902761, 4);
});

test("running out of money is reported as a result rather than thrown", () => {
  const outcome = f.sequenceOutcome({ initial: 10000, periodicWithdrawal: 6000, returns: [-0.5, -0.5, 0.1] });
  assert.equal(outcome.depleted, true);
  assert.ok(outcome.periodsSurvived < 3, "depletion is the answer being asked for, not an error");
});

test("no withdrawal makes the outcome order-independent", () => {
  const path = [0.1, -0.2, 0.3];
  const forward = f.sequenceOutcome({ initial: 1000, periodicWithdrawal: 0, returns: path });
  const back = f.sequenceOutcome({ initial: 1000, periodicWithdrawal: 0, returns: [...path].reverse() });
  near(forward.endingBalance, back.endingBalance, 8);
});

// --- Reserves --------------------------------------------------------------------------------------------

test("reserve months is the plain ratio, with no verdict attached", () => {
  const months = f.emergencyReserveMonths({ liquidReserves: 18000, monthlyExpenses: 3000 });
  near(months, 6, 10);
  assert.equal(typeof months, "number", "returning 'adequate' would settle a personal question arithmetically");
});

test("zero monthly expenses is refused rather than returning Infinity", () => {
  assert.throws(() => f.emergencyReserveMonths({ liquidReserves: 18000, monthlyExpenses: 0 }), RangeError);
});

// --- Input discipline ---------------------------------------------------------------------------------------

test("a percentage passed where a decimal was meant is refused", () => {
  // The most expensive mistake in this problem space: 5 instead of 0.05 is off by a hundredfold and
  // still looks like a number, and it compounds.
  assert.throws(() => f.futureValue({ principal: 10000, annualRate: 5, years: 10 }), RangeError);
});

test("the error message says what the convention is", () => {
  assert.throws(
    () => f.futureValue({ principal: 10000, annualRate: 8, years: 10 }),
    /5% is 0\.05, not 5/,
  );
});

test("a missing input is refused rather than producing NaN", () => {
  // A silent NaN propagating into a projection is indistinguishable from a result.
  assert.throws(() => f.futureValue({ principal: 10000, years: 10 }), RangeError);
});

test("a non-numeric input is refused", () => {
  assert.throws(() => f.futureValue({ principal: "10000", annualRate: 0.05, years: 10 }), RangeError);
});

test("a negative principal is refused", () => {
  assert.throws(() => f.futureValue({ principal: -100, annualRate: 0.05, years: 10 }), RangeError);
});

test("a fractional compounding frequency is refused", () => {
  assert.throws(() => f.futureValue({ principal: 100, annualRate: 0.05, years: 1, compoundsPerYear: 2.5 }), RangeError);
});

test("more payments than the term contains is refused", () => {
  assert.throws(
    () => f.amortizationBalance({ principal: 1000, annualRate: 0.05, years: 1, paymentsMade: 13 }),
    RangeError,
  );
});

test("mismatched weights and returns are refused", () => {
  assert.throws(() => f.weightedReturn({ weights: [0.5, 0.5], returns: [0.1] }), RangeError);
});

test("an unrecognised contribution timing is refused rather than defaulted", () => {
  assert.throws(
    () => f.futureValueWithContributions({ contribution: 100, annualRate: 0.05, years: 1, timing: "middle" }),
    RangeError,
  );
});

// --- Determinism --------------------------------------------------------------------------------------------

test("every function is deterministic, which is what makes the full-assurance claim honest", () => {
  const calls = [
    () => f.futureValue({ principal: 10000, annualRate: 0.05, years: 10 }),
    () => f.realRate({ nominalRate: 0.08, inflationRate: 0.03 }),
    () => f.amortizedPayment({ principal: 300000, annualRate: 0.06, years: 30 }),
    () => f.netRealReturn({ grossRate: 0.08, expenseRatio: 0.0075, taxRate: 0.15, inflationRate: 0.03 }),
  ];
  for (const call of calls) {
    assert.equal(call(), call(), "a check whose answer can vary establishes nothing");
  }
});

test("no function rounds internally, so the tolerance in a calc block means what its author wrote", () => {
  const value = f.futureValue({ principal: 10000, annualRate: 0.05, years: 10 });
  assert.notEqual(value, Number(value.toFixed(2)), "the raw value carries more precision than 2dp");
});
