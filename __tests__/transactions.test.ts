import {
  Container,
  sharedTokens,
} from "@christopher-peters-dev/investment-platform/di";
import type { Logger } from "@christopher-peters-dev/investment-platform/observability";
import { AppError } from "@christopher-peters-dev/investment-platform/common";
import { registerTransactionsModule, transactionsTokens } from "../src";
import { mapTransaction } from "../src/data/mappers/TransactionMapper";
import { mockTransactions } from "../src/data/datasources/MockTransactionRemoteDataSource";
import { TransactionRepositoryImpl } from "../src/data/repositories/TransactionRepositoryImpl";
import { GetTransactionsUseCase } from "../src/domain/usecases/GetTransactionsUseCase";
import { GetTransactionByIdUseCase } from "../src/domain/usecases/GetTransactionByIdUseCase";
import { TransactionsViewModel } from "../src/presentation/viewmodels/TransactionsViewModel";
import type { TransactionRepository } from "../src/domain/repositories/TransactionRepository";
const logger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
function bootstrap(mode: "success" | "empty" | "error" = "success") {
  const c = new Container();
  c.register(sharedTokens.logger, logger);
  registerTransactionsModule(c, { mockMode: mode, delayMs: 0 });
  return c;
}
test("DI shares services and creates independent presentation state", () => {
  const c = bootstrap();
  expect(c.resolve(transactionsTokens.repository)).toBe(
    c.resolve(transactionsTokens.repository),
  );
  expect(c.resolve(transactionsTokens.viewModel)).not.toBe(
    c.resolve(transactionsTokens.viewModel),
  );
});
test("loads exact data, all-date totals, filtering and detail lookup", async () => {
  const c = bootstrap();
  const vm = c.resolve(transactionsTokens.viewModel);
  expect(vm.getSnapshot().status).toBe("loading");
  await vm.load();
  const state = vm.getSnapshot();
  if (state.status !== "success") throw Error("Not loaded");
  expect(state.transactions).toHaveLength(4);
  expect(state.summary).toEqual({ invested: 45500, withdrawn: 15000 });
  vm.setFilter("Withdrawals");
  const filtered = vm.getSnapshot();
  if (filtered.status !== "success") throw Error("Not loaded");
  expect(filtered.visibleTransactions.map((t) => t.reference)).toEqual([
    "TXN-20260921-002",
  ]);
  vm.setFilter("Investments");
  expect(vm.getSnapshot()).toMatchObject({
    visibleTransactions: expect.any(Array),
  });
  await vm.loadDetails("txn-4");
  expect(vm.getDetailsSnapshot()).toMatchObject({
    status: "success",
    transaction: { status: "Pending", amount: 8000 },
  });
  await vm.loadDetails("missing");
  expect(vm.getDetailsSnapshot()).toEqual({
    status: "error",
    message: "Transaction not found.",
  });
});
test.each(["empty", "error"] as const)("handles %s state", async (mode) => {
  const vm = bootstrap(mode).resolve(transactionsTokens.viewModel);
  await vm.load();
  expect(vm.getSnapshot().status).toBe(mode);
});
test("validates malformed DTOs rather than allowing invalid financial values", () => {
  expect(() => mapTransaction({ ...mockTransactions[0], amount: NaN })).toThrow(
    AppError,
  );
  expect(() =>
    mapTransaction({ ...mockTransactions[0], status: "Unknown" }),
  ).toThrow(AppError);
});
test("repository errors become Results and retry recovers", async () => {
  let calls = 0;
  const repository = new TransactionRepositoryImpl(
    {
      getTransactions: async () => {
        if (++calls === 1) throw Error("offline");
        return mockTransactions;
      },
    },
    logger,
  );
  const vm = new TransactionsViewModel(
    new GetTransactionsUseCase(repository, logger),
    new GetTransactionByIdUseCase(repository, logger),
    logger,
  );
  await vm.load();
  expect(vm.getSnapshot().status).toBe("error");
  await vm.load();
  expect(vm.getSnapshot().status).toBe("success");
  expect(logger.error).toHaveBeenCalled();
});
test("cancelled results do not replace current state", async () => {
  let resolve:
    | ((
        value: Awaited<ReturnType<TransactionRepository["getTransactions"]>>,
      ) => void)
    | undefined;
  const repository: TransactionRepository = {
    getTransactions: () =>
      new Promise((r) => {
        resolve = r;
      }),
    getTransactionById: async () => ({
      ok: false,
      error: new AppError("Not found"),
    }),
  };
  const vm = new TransactionsViewModel(
    new GetTransactionsUseCase(repository, logger),
    new GetTransactionByIdUseCase(repository, logger),
    logger,
  );
  const loading = vm.load();
  vm.cancelPending();
  resolve?.({ ok: true, value: [mapTransaction(mockTransactions[0])] });
  await loading;
  expect(vm.getSnapshot().status).toBe("loading");
});
