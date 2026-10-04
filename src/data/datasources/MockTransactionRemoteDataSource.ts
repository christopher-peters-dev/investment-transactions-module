import { AppError } from "@christopher-peters-dev/investment-platform/common";
import type { TransactionDto } from "../dto/TransactionDto";
import type { TransactionRemoteDataSource } from "./TransactionRemoteDataSource";
export type TransactionMockMode = "success" | "empty" | "error";
export const mockTransactions: readonly TransactionDto[] = [
  {
    id: "txn-1",
    date: "2026-10-03",
    type: "Investment",
    investment_name: "Axis Bluechip Fund",
    amount: 25000,
    status: "Completed",
    reference: "TXN-20261003-001",
  },
  {
    id: "txn-2",
    date: "2026-09-21",
    type: "Withdrawal",
    investment_name: "HDFC Fixed Deposit",
    amount: 15000,
    status: "Completed",
    reference: "TXN-20260921-002",
  },
  {
    id: "txn-3",
    date: "2026-09-10",
    type: "Investment",
    investment_name: "Nifty 50 Index Fund",
    amount: 12500,
    status: "Completed",
    reference: "TXN-20260910-003",
  },
  {
    id: "txn-4",
    date: "2026-08-29",
    type: "Investment",
    investment_name: "SBI Gold Fund",
    amount: 8000,
    status: "Pending",
    reference: "TXN-20260829-004",
  },
];
export class MockTransactionRemoteDataSource
  implements TransactionRemoteDataSource
{
  constructor(
    private readonly mode: TransactionMockMode = "success",
    private readonly delayMs = 600,
  ) {}
  async getTransactions(): Promise<readonly unknown[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, this.delayMs));
    if (this.mode === "error")
      throw new AppError(
        "Unable to load transactions. Please try again.",
        "LOAD_FAILED",
      );
    return this.mode === "empty" ? [] : mockTransactions;
  }
}
