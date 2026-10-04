export type TransactionType = "Investment" | "Withdrawal";
export type TransactionStatus = "Completed" | "Pending";
export type TransactionFilter = "All" | "Investments" | "Withdrawals";
export interface Transaction {
  readonly id: string;
  readonly date: string;
  readonly type: TransactionType;
  readonly investmentName: string;
  readonly amount: number;
  readonly status: TransactionStatus;
  readonly reference: string;
}
// Domain owns filtering and totals; the UI only displays their results.
export function filterTransactions(
  items: readonly Transaction[],
  filter: TransactionFilter
): readonly Transaction[] {
  if (filter === "All") return items;
  const type = filter === "Investments" ? "Investment" : "Withdrawal";
  return items.filter((item) => item.type === type);
}
export function summarizeTransactions(items: readonly Transaction[]) {
  return items.reduce(
    (summary, item) => ({
      invested:
        summary.invested + (item.type === "Investment" ? item.amount : 0),
      withdrawn:
        summary.withdrawn + (item.type === "Withdrawal" ? item.amount : 0),
    }),
    { invested: 0, withdrawn: 0 }
  );
}
