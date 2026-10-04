import { AppError } from "@christopher-peters-dev/investment-platform/common";
import type { Result } from "@christopher-peters-dev/investment-platform/common";
import type { Logger } from "@christopher-peters-dev/investment-platform/observability";
import type { Transaction } from "../../domain/entities/Transaction";
import type { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import type { TransactionRemoteDataSource } from "../datasources/TransactionRemoteDataSource";
import { mapTransaction } from "../mappers/TransactionMapper";
export class TransactionRepositoryImpl implements TransactionRepository {
  constructor(
    private readonly source: TransactionRemoteDataSource,
    private readonly logger: Logger,
  ) {}
  async getTransactions(): Promise<Result<readonly Transaction[]>> {
    try {
      return {
        ok: true,
        value: (await this.source.getTransactions())
          .map(mapTransaction)
          .sort((a, b) => b.date.localeCompare(a.date)),
      };
    } catch (cause: unknown) {
      const error =
        cause instanceof AppError
          ? cause
          : new AppError("Unable to load transactions.", "LOAD_FAILED", cause);
      this.logger.error("Transaction repository failed", { code: error.code });
      return { ok: false, error };
    }
  }
  async getTransactionById(id: string): Promise<Result<Transaction>> {
    const result = await this.getTransactions();
    if (!result.ok) return result;
    const transaction = result.value.find((item) => item.id === id);
    if (transaction) return { ok: true, value: transaction };
    const error = new AppError("Transaction not found.", "NOT_FOUND");
    this.logger.warn("Transaction lookup failed", { id, code: error.code });
    return { ok: false, error };
  }
}
