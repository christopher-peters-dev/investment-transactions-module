import {
  Container,
  createToken,
  sharedTokens,
} from "@christopher-peters-dev/investment-platform/di";
import type { TransactionRepository } from "../domain/repositories/TransactionRepository";
import type { TransactionRemoteDataSource } from "../data/datasources/TransactionRemoteDataSource";
import {
  MockTransactionRemoteDataSource,
  type TransactionMockMode,
} from "../data/datasources/MockTransactionRemoteDataSource";
import { TransactionRepositoryImpl } from "../data/repositories/TransactionRepositoryImpl";
import { GetTransactionsUseCase } from "../domain/usecases/GetTransactionsUseCase";
import { GetTransactionByIdUseCase } from "../domain/usecases/GetTransactionByIdUseCase";
import { TransactionsViewModel } from "../presentation/viewmodels/TransactionsViewModel";
export const transactionsTokens = {
  source: createToken<TransactionRemoteDataSource>(
    "TransactionRemoteDataSource",
  ),
  repository: createToken<TransactionRepository>("TransactionRepository"),
  getTransactions: createToken<GetTransactionsUseCase>(
    "GetTransactionsUseCase",
  ),
  getTransaction: createToken<GetTransactionByIdUseCase>(
    "GetTransactionByIdUseCase",
  ),
  viewModel: createToken<TransactionsViewModel>("TransactionsViewModel"),
};
// Feature bindings only. Host creates the container and supplies the shared logger.
export function registerTransactionsModule(
  container: Container,
  options: { mockMode?: TransactionMockMode; delayMs?: number } = {},
): void {
  const logger = container.resolve(sharedTokens.logger);
  container.register(
    transactionsTokens.source,
    new MockTransactionRemoteDataSource(options.mockMode, options.delayMs),
  );
  container.register(
    transactionsTokens.repository,
    new TransactionRepositoryImpl(
      container.resolve(transactionsTokens.source),
      logger,
    ),
  );
  container.register(
    transactionsTokens.getTransactions,
    new GetTransactionsUseCase(
      container.resolve(transactionsTokens.repository),
      logger,
    ),
  );
  container.register(
    transactionsTokens.getTransaction,
    new GetTransactionByIdUseCase(
      container.resolve(transactionsTokens.repository),
      logger,
    ),
  );
  container.registerFactory(
    transactionsTokens.viewModel,
    () =>
      new TransactionsViewModel(
        container.resolve(transactionsTokens.getTransactions),
        container.resolve(transactionsTokens.getTransaction),
        logger,
      ),
  );
  logger.info("Transactions module registered");
}
