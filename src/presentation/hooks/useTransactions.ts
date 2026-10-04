import { useEffect, useSyncExternalStore } from "react";
import type { TransactionsViewModel } from "../viewmodels/TransactionsViewModel";
export function useTransactions(viewModel: TransactionsViewModel) {
  const state = useSyncExternalStore(
    viewModel.subscribe,
    viewModel.getSnapshot
  );
  useEffect(() => {
    void viewModel.load();
    return viewModel.cancelPending;
  }, [viewModel]);
  return { state, reload: viewModel.load, setFilter: viewModel.setFilter };
}
export function useTransactionDetails(
  viewModel: TransactionsViewModel,
  id: string
) {
  const state = useSyncExternalStore(
    viewModel.subscribe,
    viewModel.getDetailsSnapshot
  );
  useEffect(() => {
    void viewModel.loadDetails(id);
    return viewModel.cancelDetails;
  }, [viewModel, id]);
  return {
    state,
    reload: () => {
      void viewModel.loadDetails(id);
    },
  };
}
