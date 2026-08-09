/**
 * Financial mathematics: pure functions, checkable answers.
 *
 * This module is the only place in the repository where a rule can honestly claim full assurance
 * (ADR 0002), because it is the only part of the subject matter with a right answer. Whether an
 * analysis disclosed enough about its assumptions is a judgement. Whether $10,000 at 5% for 10 years
 * is $16,288.95 is not.
 *
 * FIVE PROPERTIES, all load-bearing:
 *
 *   1. PURE. No I/O, no state, no mutation of inputs.
 *   2. DETERMINISTIC. No `Date`, no `Math.random`, no locale-dependent formatting. The same inputs
 *      produce the same output on any machine, forever. This is what makes the full-assurance claim
 *      honest: a check whose answer can vary establishes nothing about the document.
 *   3. NO INTERNAL ROUNDING. Callers decide precision. Rounding here would make the tolerance in a
 *      calc block meaningless, because the author could not tell whose rounding they were seeing.
 *   4. INVALID INPUT THROWS. A silent `NaN` propagating into a projection is indistinguishable from
 *      a result — it formats as "NaN" if you are lucky and as a plausible number if you are not.
 *      `RangeError` is the domain's version of a failed assertion.
 *   5. OPTIONS OBJECTS. Every input is named at the call site. `(10000, 0.05, 10)` hides which
 *      number is the rate; `{ principal, annualRate, years }` cannot.
 *
 * RATES ARE DECIMALS. 5% is `0.05`, never `5`. A percentage-versus-decimal mix-up is the most
 * expensive error in this file's problem space — it is off by a hundredfold and still looks like a
 * number — so `assertRate` rejects magnitudes above 1 for rates that have no business exceeding it.
 */

// --- Input discipline ----------------------------------------------------------------------------

function assertFinite(name, value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, received ${JSON.stringify(value)}`);
  }
  return value;
}

function assertPositive(name, value) {
  assertFinite(name, value);
  if (value <= 0) throw new RangeError(`${name} must be greater than zero, received ${value}`);
  return value;
}

function assertNonNegative(name, value) {
  assertFinite(name, value);
  if (value < 0) throw new RangeError(`${name} must not be negative, received ${value}`);
  return value;
}

/**
 * A rate expressed as a decimal fraction.
 *
 * `max` defaults to 1 (100%). Passing 5 where 0.05 was meant is the error this catches, and it is
 * worth catching loudly: a hundredfold overstatement of a return is still a plausible-looking
 * number, and it compounds. Rates that legitimately exceed 100% — a hyperinflation scenario, a
 * venture return — pass an explicit higher `max`, which makes the unusual case a visible decision.
 */
function assertRate(name, value, { min = -1, max = 1 } = {}) {
  assertFinite(name, value);
  if (value < min || value > max) {
    throw new RangeError(
      `${name} must be a decimal fraction between ${min} and ${max}, received ${value}. ` +
        `Rates are decimals here: 5% is 0.05, not 5.`,
    );
  }
  return value;
}

function assertArray(name, value, { minLength = 1 } = {}) {
  if (!Array.isArray(value)) throw new RangeError(`${name} must be an array`);
  if (value.length < minLength) {
    throw new RangeError(`${name} must have at least ${minLength} element(s), received ${value.length}`);
  }
  value.forEach((v, i) => assertFinite(`${name}[${i}]`, v));
  return value;
}

function assertPeriods(name, value) {
  assertPositive(name, value);
  if (!Number.isInteger(value)) throw new RangeError(`${name} must be a whole number, received ${value}`);
  return value;
}

// --- Growth and compounding -----------------------------------------------------------------------

/**
 * Value of a lump sum after compound growth.
 *
 * `compoundsPerYear` defaults to 1 (annual). Note that this is NOT a cosmetic choice: at the same
 * stated nominal rate, more frequent compounding produces a larger result, which is why
 * `effectiveAnnualRate` exists to make two differently-compounded rates comparable.
 */
export function futureValue({ principal, annualRate, years, compoundsPerYear = 1 }) {
  assertNonNegative("principal", principal);
  assertRate("annualRate", annualRate);
  assertNonNegative("years", years);
  assertPeriods("compoundsPerYear", compoundsPerYear);
  return principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years);
}

/**
 * Value of a lump sum plus a regular contribution.
 *
 * `timing` is "end" (ordinary annuity) or "begin" (annuity due). The difference is one period of
 * growth on every contribution, which over decades is not a rounding detail — it is the difference
 * between contributing on the first of the month and the last, and an analysis that does not say
 * which it assumed has hidden an assumption.
 */
export function futureValueWithContributions({
  principal = 0, contribution, annualRate, years, contributionsPerYear = 12, timing = "end",
}) {
  assertNonNegative("principal", principal);
  assertNonNegative("contribution", contribution);
  assertRate("annualRate", annualRate);
  assertNonNegative("years", years);
  assertPeriods("contributionsPerYear", contributionsPerYear);
  if (timing !== "end" && timing !== "begin") {
    throw new RangeError(`timing must be "end" or "begin", received ${JSON.stringify(timing)}`);
  }

  const periods = contributionsPerYear * years;
  const rate = annualRate / contributionsPerYear;
  const grownPrincipal = principal * Math.pow(1 + rate, periods);

  // A zero rate is a real case, not an edge case to reject: the annuity factor's closed form divides
  // by the rate, so it is computed directly instead.
  const annuityFactor = rate === 0 ? periods : (Math.pow(1 + rate, periods) - 1) / rate;
  const due = timing === "begin" ? 1 + rate : 1;
  return grownPrincipal + contribution * annuityFactor * due;
}

/** Compound annual growth rate implied by a start value, an end value, and a duration. */
export function cagr({ beginValue, endValue, years }) {
  assertPositive("beginValue", beginValue);
  assertPositive("endValue", endValue);
  assertPositive("years", years);
  return Math.pow(endValue / beginValue, 1 / years) - 1;
}

/**
 * The annual rate that, compounded once, equals the stated nominal rate compounded n times.
 *
 * This is what makes two quoted rates comparable. Comparing a rate compounded monthly against one
 * compounded annually without converting is a like-for-unlike comparison.
 */
export function effectiveAnnualRate({ nominalRate, compoundsPerYear }) {
  assertRate("nominalRate", nominalRate);
  assertPeriods("compoundsPerYear", compoundsPerYear);
  return Math.pow(1 + nominalRate / compoundsPerYear, compoundsPerYear) - 1;
}

/** Value after a specific sequence of periodic returns. Order does not matter to the result here. */
export function growthOfPath({ initial, returns }) {
  assertNonNegative("initial", initial);
  assertArray("returns", returns);
  returns.forEach((r, i) => assertRate(`returns[${i}]`, r));
  return returns.reduce((value, r) => value * (1 + r), initial);
}

// --- Real versus nominal ---------------------------------------------------------------------------

/**
 * The Fisher relation: (1 + nominal) / (1 + inflation) − 1.
 *
 * Deliberately NOT the subtraction approximation `nominal − inflation`. The approximation is close
 * at low rates and diverges as either rate rises, and a standard that requires real returns to be
 * distinguished from nominal ones cannot itself use an approximation that blurs them. At 8% nominal
 * and 3% inflation the approximation says 5.00% and the exact form says 4.854% — a gap that
 * compounds into a materially different projection over thirty years.
 */
export function realRate({ nominalRate, inflationRate }) {
  assertRate("nominalRate", nominalRate);
  assertRate("inflationRate", inflationRate);
  if (inflationRate <= -1) throw new RangeError("inflationRate must be greater than -1");
  return (1 + nominalRate) / (1 + inflationRate) - 1;
}

/** Purchasing power of a future nominal amount, expressed in today's money. */
export function realValue({ nominalValue, inflationRate, years }) {
  assertFinite("nominalValue", nominalValue);
  assertRate("inflationRate", inflationRate);
  assertNonNegative("years", years);
  if (inflationRate <= -1) throw new RangeError("inflationRate must be greater than -1");
  return nominalValue / Math.pow(1 + inflationRate, years);
}

// --- Debt -------------------------------------------------------------------------------------------

/** The level payment that amortises a principal to zero over the full term. */
export function amortizedPayment({ principal, annualRate, years, paymentsPerYear = 12 }) {
  assertPositive("principal", principal);
  assertRate("annualRate", annualRate);
  assertPositive("years", years);
  assertPeriods("paymentsPerYear", paymentsPerYear);

  const periods = paymentsPerYear * years;
  const rate = annualRate / paymentsPerYear;
  if (rate === 0) return principal / periods;
  return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

/** Outstanding balance after a number of level payments. */
export function amortizationBalance({ principal, annualRate, years, paymentsPerYear = 12, paymentsMade }) {
  assertNonNegative("paymentsMade", paymentsMade);
  const periods = paymentsPerYear * years;
  if (paymentsMade > periods) {
    throw new RangeError(`paymentsMade (${paymentsMade}) exceeds the ${periods} payments in the term`);
  }
  const payment = amortizedPayment({ principal, annualRate, years, paymentsPerYear });
  const rate = annualRate / paymentsPerYear;
  if (rate === 0) return principal - payment * paymentsMade;
  return principal * Math.pow(1 + rate, paymentsMade) - payment * ((Math.pow(1 + rate, paymentsMade) - 1) / rate);
}

/**
 * Total interest paid over the full term.
 *
 * Worth stating explicitly in an analysis because it is the number borrowers most often have not
 * seen: a payment schedule shows the monthly cost, and the lifetime cost of the borrowing is
 * nowhere on it.
 */
export function totalInterestPaid({ principal, annualRate, years, paymentsPerYear = 12 }) {
  const payment = amortizedPayment({ principal, annualRate, years, paymentsPerYear });
  return payment * paymentsPerYear * years - principal;
}

// --- Fees, taxes, and the chain ----------------------------------------------------------------------

/**
 * Return after an expense ratio, applied multiplicatively rather than by subtraction.
 *
 * The fee is charged on assets, so it reduces the growth factor rather than the rate:
 * (1 + gross) × (1 − ratio) − 1. Subtracting understates the drag slightly, and understating fee
 * drag is a directional error — it always flatters the investment.
 */
export function afterFeeRate({ grossRate, expenseRatio }) {
  assertRate("grossRate", grossRate);
  assertRate("expenseRatio", expenseRatio, { min: 0, max: 1 });
  return (1 + grossRate) * (1 - expenseRatio) - 1;
}

/** Return after tax on the gain. A negative return is returned unchanged: a loss is not taxed here. */
export function afterTaxRate({ rate, taxRate }) {
  assertRate("rate", rate);
  assertRate("taxRate", taxRate, { min: 0, max: 1 });
  return rate <= 0 ? rate : rate * (1 - taxRate);
}

/**
 * The full chain: gross → after fees → after tax → after inflation.
 *
 * Order matters and is not arbitrary. Fees are charged on assets before any return is realised;
 * tax is levied on the realised gain, which is already net of fees; inflation erodes what is left.
 * Applying them in a different order produces a different answer, so the order is fixed here rather
 * than left to each analysis to decide — and it is the single call that Standards 8, 9, 10, and 11
 * together require.
 */
export function netRealReturn({ grossRate, expenseRatio = 0, taxRate = 0, inflationRate = 0 }) {
  const afterFees = afterFeeRate({ grossRate, expenseRatio });
  const afterTax = afterTaxRate({ rate: afterFees, taxRate });
  return realRate({ nominalRate: afterTax, inflationRate });
}

// --- Portfolio ----------------------------------------------------------------------------------------

/** Weighted return of a portfolio. Weights must sum to 1 within a small tolerance. */
export function weightedReturn({ weights, returns }) {
  assertArray("weights", weights);
  assertArray("returns", returns);
  if (weights.length !== returns.length) {
    throw new RangeError(`weights (${weights.length}) and returns (${returns.length}) must be the same length`);
  }
  const total = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-9) {
    throw new RangeError(`weights must sum to 1, received ${total}. A portfolio that does not sum to 1 is not a portfolio.`);
  }
  return weights.reduce((acc, w, i) => acc + w * returns[i], 0);
}

/**
 * Two concentration measures, because one is not enough.
 *
 * `maxWeight` is the largest single position — the intuitive reading of concentration.
 * `herfindahl` is the sum of squared weights, which captures the whole distribution: a portfolio of
 * two 50% positions and one of ten positions where the largest is 50% have the same `maxWeight` and
 * very different risk. `effectiveHoldings` is 1/HHI, the number of equal-sized positions that would
 * give the same concentration — usually the most legible of the three.
 */
export function portfolioConcentration({ weights }) {
  assertArray("weights", weights);
  weights.forEach((w, i) => assertNonNegative(`weights[${i}]`, w));
  const total = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-9) throw new RangeError(`weights must sum to 1, received ${total}`);
  const herfindahl = weights.reduce((acc, w) => acc + w * w, 0);
  return {
    maxWeight: Math.max(...weights),
    herfindahl,
    effectiveHoldings: 1 / herfindahl,
  };
}

// --- Dispersion and drawdown ----------------------------------------------------------------------------

export function arithmeticMean({ returns }) {
  assertArray("returns", returns);
  return returns.reduce((a, b) => a + b, 0) / returns.length;
}

/**
 * The compound rate that reproduces the same end value — always at most the arithmetic mean.
 *
 * The gap between the two is volatility drag, and it is why an "average return" quoted as an
 * arithmetic mean overstates what an investor actually earned. +50% then −50% averages 0% and leaves
 * you with 75% of your money.
 */
export function geometricMean({ returns }) {
  assertArray("returns", returns);
  returns.forEach((r, i) => {
    if (r <= -1) throw new RangeError(`returns[${i}] of ${r} would wipe out the position; geometric mean is undefined`);
  });
  const product = returns.reduce((acc, r) => acc * (1 + r), 1);
  return Math.pow(product, 1 / returns.length) - 1;
}

/**
 * Standard deviation of a return series.
 *
 * `sample: true` (the default) uses the n−1 denominator, which is correct when the series is a
 * sample of a longer history rather than the complete population — which it essentially always is
 * for market returns.
 */
export function stdev({ returns, sample = true }) {
  assertArray("returns", returns, { minLength: sample ? 2 : 1 });
  const mean = arithmeticMean({ returns });
  const sumSquares = returns.reduce((acc, r) => acc + (r - mean) ** 2, 0);
  return Math.sqrt(sumSquares / (sample ? returns.length - 1 : returns.length));
}

/**
 * Largest peak-to-trough decline in a value series, as a positive fraction.
 *
 * Reported alongside volatility because they answer different questions. Standard deviation
 * describes how much values move; maximum drawdown describes the worst loss actually sustained,
 * which is the number that determines whether someone sells at the bottom.
 */
export function maxDrawdown({ values }) {
  assertArray("values", values, { minLength: 2 });
  values.forEach((v, i) => assertPositive(`values[${i}]`, v));
  let peak = values[0];
  let worst = 0;
  for (const value of values) {
    if (value > peak) peak = value;
    const decline = (peak - value) / peak;
    if (decline > worst) worst = decline;
  }
  return worst;
}

// --- Sequence risk ------------------------------------------------------------------------------------------

/**
 * Outcome of withdrawing a fixed amount each period against a specific return path.
 *
 * The whole point of this function is that **the order of `returns` changes the answer**, even
 * though the same returns in any order produce an identical result with no withdrawals. Poor returns
 * early, while the balance is large and withdrawals are proportionally bigger, do damage that later
 * good returns cannot undo. That is sequence-of-returns risk, and demonstrating it takes two calls
 * with the same array reversed.
 *
 * Withdrawal is taken at the START of each period, before that period's return: an ordinary reading
 * of "I withdraw at the beginning of the year". `depleted` reports whether the balance ran out, and
 * `periodsSurvived` how far it got — reported rather than thrown, because running out IS the result
 * being asked for.
 */
export function sequenceOutcome({ initial, periodicWithdrawal, returns }) {
  assertPositive("initial", initial);
  assertNonNegative("periodicWithdrawal", periodicWithdrawal);
  assertArray("returns", returns);
  returns.forEach((r, i) => assertRate(`returns[${i}]`, r));

  let balance = initial;
  let periodsSurvived = 0;
  let totalWithdrawn = 0;

  for (const r of returns) {
    if (balance < periodicWithdrawal) {
      totalWithdrawn += balance;
      balance = 0;
      break;
    }
    balance -= periodicWithdrawal;
    totalWithdrawn += periodicWithdrawal;
    balance *= 1 + r;
    periodsSurvived++;
  }

  return {
    endingBalance: balance,
    periodsSurvived,
    totalWithdrawn,
    depleted: balance === 0,
  };
}

// --- Reserves -------------------------------------------------------------------------------------------------

/**
 * How many months of expenses the liquid reserves cover.
 *
 * Deliberately returns the raw ratio and no verdict. Whether that number is adequate depends on
 * income stability, dependants, insurance, and access to credit — none of which this function knows.
 * A function that returned "adequate" or "inadequate" would be treating a mathematically computable
 * quantity as if it settled a personal question, which is exactly what the standards forbid.
 */
export function emergencyReserveMonths({ liquidReserves, monthlyExpenses }) {
  assertNonNegative("liquidReserves", liquidReserves);
  assertPositive("monthlyExpenses", monthlyExpenses);
  return liquidReserves / monthlyExpenses;
}
