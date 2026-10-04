import type { Result } from "@christopher-peters-dev/investment-platform/common";
import type { Logger } from "@christopher-peters-dev/investment-platform/observability";
import type { Transaction } from "../entities/Transaction";
import type { TransactionRepository } from "../repositories/TransactionRepository";
export class GetTransactionsUseCase {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly logger: Logger,
  ) {}
  async execute(): Promise<Result<readonly Transaction[]>> {
    const result = await this.repository.getTransactions();
    if (!result.ok)
      this.logger.warn("GetTransactionsUseCase failed", {
        code: result.error.code,
      });
    return result;
  }
}
