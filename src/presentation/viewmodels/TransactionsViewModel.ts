import type { Logger } from "@christopher-peters-dev/investment-platform/observability";
import type {
  Transaction,
  TransactionFilter,
} from "../../domain/entities/Transaction";
import {
  filterTransactions,
  summarizeTransactions,
} from "../../domain/entities/Transaction";
import type { GetTransactionsUseCase } from "../../domain/usecases/GetTransactionsUseCase";
import type { GetTransactionByIdUseCase } from "../../domain/usecases/GetTransactionByIdUseCase";
export type TransactionsState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | {
      status: "success";
      transactions: readonly Transaction[];
      filter: TransactionFilter;
      visibleTransactions: readonly Transaction[];
      summary: { invested: number; withdrawn: number };
    };
export type TransactionDetailsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; transaction: Transaction };
export class TransactionsViewModel {
  private state: TransactionsState = { status: "loading" };
  private details: TransactionDetailsState = { status: "loading" };
  private filter: TransactionFilter = "All";
  private readonly listeners = new Set<() => void>();
  private requestId = 0;
  private detailsRequestId = 0;
  constructor(
    private readonly getTransactions: GetTransactionsUseCase,
    private readonly getTransaction: GetTransactionByIdUseCase,
    private readonly logger: Logger,
  ) {}
  getSnapshot = (): TransactionsState => this.state;
  getDetailsSnapshot = (): TransactionDetailsState => this.details;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private notify() {
    this.listeners.forEach((listener) => listener());
  }
  cancelPending = () => {
    this.requestId++;
    this.detailsRequestId++;
  };
  cancelDetails = () => {
    this.detailsRequestId++;
  };
  setFilter = (filter: TransactionFilter) => {
    this.filter = filter;
    if (this.state.status === "success") {
      this.state = {
        ...this.state,
        filter,
        visibleTransactions: filterTransactions(
          this.state.transactions,
          filter,
        ),
      };
      this.notify();
    }
  };
  load = async (): Promise<void> => {
    const request = ++this.requestId;
    this.state = { status: "loading" };
    this.notify();
    try {
      const result = await this.getTransactions.execute();
      if (request !== this.requestId) return;
      if (!result.ok) {
        this.logger.warn("Transactions loading failed", {
          code: result.error.code,
        });
        this.state = { status: "error", message: result.error.message };
      } else if (!result.value.length) this.state = { status: "empty" };
      else {
        this.state = {
          status: "success",
          transactions: result.value,
          filter: this.filter,
          visibleTransactions: filterTransactions(result.value, this.filter),
          summary: summarizeTransactions(result.value),
        };
        this.logger.info("Transactions loaded", { count: result.value.length });
      }
    } catch (cause: unknown) {
      if (request !== this.requestId) return;
      this.logger.error("Unexpected transactions failure", {
        error: cause instanceof Error ? cause.message : "Unknown",
      });
      this.state = {
        status: "error",
        message: "Unable to load transactions. Please try again.",
      };
    }
    this.notify();
  };
  loadDetails = async (id: string): Promise<void> => {
    const request = ++this.detailsRequestId;
    this.details = { status: "loading" };
    this.notify();
    try {
      const result = await this.getTransaction.execute(id);
      if (request !== this.detailsRequestId) return;
      this.details = result.ok
        ? { status: "success", transaction: result.value }
        : { status: "error", message: result.error.message };
      if (!result.ok)
        this.logger.warn("Transaction details failed", {
          code: result.error.code,
        });
    } catch (cause: unknown) {
      if (request !== this.detailsRequestId) return;
      this.logger.error("Unexpected transaction details failure", {
        error: cause instanceof Error ? cause.message : "Unknown",
      });
      this.details = {
        status: "error",
        message: "Unable to load transaction details.",
      };
    }
    this.notify();
  };
}
