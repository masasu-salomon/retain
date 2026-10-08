/** Share of the budget at which a user is considered "approaching" their limit. */
export const APPROACHING_THRESHOLD = 0.8;

/**
 * Summarises spending against a monthly budget.
 * status: "none" (no budget set) | "within" | "approaching" | "over"
 */
export const buildBudgetSummary = (budgetAmount, totalSpent) => {
  if (budgetAmount == null) {
    return { budget: null, totalSpent, remaining: null, percentUsed: null, status: 'none' };
  }

  const remaining = Math.round((budgetAmount - totalSpent) * 100) / 100;
  const ratio = budgetAmount > 0 ? totalSpent / budgetAmount : totalSpent > 0 ? Infinity : 0;

  let status = 'within';
  if (ratio > 1) status = 'over';
  else if (ratio >= APPROACHING_THRESHOLD) status = 'approaching';

  return {
    budget: budgetAmount,
    totalSpent,
    remaining,
    percentUsed: Number.isFinite(ratio) ? Math.round(ratio * 1000) / 10 : null,
    status,
  };
};
