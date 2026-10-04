import type { Result } from "@christopher-peters-dev/investment-platform/common";
import type { Transaction } from "../entities/Transaction";
export interface TransactionRepository {
  getTransactions(): Promise<Result<readonly Transaction[]>>;
  getTransactionById(id: string): Promise<Result<Transaction>>;
}
