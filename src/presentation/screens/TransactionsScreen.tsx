import React from "react";
import { ActivityIndicator, FlatList, View, StyleSheet } from "react-native";
import {
  AppScreen,
  AppHeader,
  AppText,
  AppCard,
  AppButton,
  spacing,
  colors,
} from "@christopher-peters-dev/investment-platform/design-system";
import { formatRupees } from "@christopher-peters-dev/investment-platform/common";
import type { TransactionFilter } from "../../domain/entities/Transaction";
import type { TransactionsViewModel } from "../viewmodels/TransactionsViewModel";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionCard } from "../components/TransactionCard";
const filters: readonly TransactionFilter[] = [
  "All",
  "Investments",
  "Withdrawals",
];
export function TransactionsScreen({
  viewModel,
  onSelectTransaction,
}: {
  viewModel: TransactionsViewModel;
  onSelectTransaction: (id: string) => void;
}) {
  const { state, reload, setFilter } = useTransactions(viewModel);
  return (
    <AppScreen>
      <AppHeader
        title="Transaction History"
        subtitle="Review your recent investment activity"
      />
      {state.status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText tone="muted">Loading transactions…</AppText>
        </View>
      )}
      {state.status === "error" && (
        <View style={styles.content}>
          <AppCard>
            <AppText variant="heading" accessibilityRole="alert">
              Unable to load transactions
            </AppText>
            <AppText tone="muted" style={styles.gap}>
              {state.message}
            </AppText>
            <AppButton
              title="Try again"
              onPress={() => {
                void reload();
              }}
            />
          </AppCard>
        </View>
      )}
      {state.status === "empty" && (
        <View style={styles.content}>
          <AppCard>
            <AppText variant="heading">No transactions yet</AppText>
            <AppText tone="muted" style={styles.gap}>
              Your investment activity will appear here.
            </AppText>
            <AppButton
              title="Refresh transactions"
              onPress={() => {
                void reload();
              }}
            />
          </AppCard>
        </View>
      )}
      {state.status === "success" && (
        <FlatList
          data={state.visibleTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.header}>
              <AppCard>
                <AppText variant="heading">Activity summary</AppText>
                <AppText variant="caption" tone="muted">
                  All demo dates · includes pending investments
                </AppText>
                <View style={styles.row}>
                  <View>
                    <AppText tone="muted">Invested</AppText>
                    <AppText variant="heading">
                      {formatRupees(state.summary.invested)}
                    </AppText>
                  </View>
                  <View>
                    <AppText tone="muted">Withdrawn</AppText>
                    <AppText variant="heading">
                      {formatRupees(state.summary.withdrawn)}
                    </AppText>
                  </View>
                </View>
              </AppCard>
              <View style={styles.filters}>
                {filters.map((filter) => (
                  <AppButton
                    key={filter}
                    title={filter}
                    variant={state.filter === filter ? "primary" : "secondary"}
                    onPress={() => setFilter(filter)}
                    style={styles.filter}
                  />
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            <AppText tone="muted">No transactions match this filter.</AppText>
          }
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={() => onSelectTransaction(item.id)}
            />
          )}
          ListFooterComponent={
            <AppText variant="caption" tone="muted" style={styles.gap}>
              Mock activity · no transactions are performed.
            </AppText>
          }
        />
      )}
    </AppScreen>
  );
}
function Separator() {
  return <View style={styles.gap} />;
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  gap: { marginTop: spacing.lg },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filter: { minHeight: 44, paddingHorizontal: spacing.md },
});
