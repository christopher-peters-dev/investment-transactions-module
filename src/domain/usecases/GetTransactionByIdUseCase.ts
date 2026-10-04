import type { Result } from "@christopher-peters-dev/investment-platform/common";
import type { Logger } from "@christopher-peters-dev/investment-platform/observability";
import type { Transaction } from "../entities/Transaction";
import type { TransactionRepository } from "../repositories/TransactionRepository";
export class GetTransactionByIdUseCase {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly logger: Logger,
  ) {}
  async execute(id: string): Promise<Result<Transaction>> {
    const result = await this.repository.getTransactionById(id);
    if (!result.ok)
      this.logger.warn("GetTransactionByIdUseCase failed", {
        code: result.error.code,
      });
    return result;
  }
}
