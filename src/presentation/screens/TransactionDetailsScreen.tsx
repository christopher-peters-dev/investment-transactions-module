import React from "react";
import { ActivityIndicator, ScrollView, View, StyleSheet } from "react-native";
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  AppButton,
  AppDivider,
  spacing,
  colors,
} from "@christopher-peters-dev/investment-platform/design-system";
import { formatRupees } from "@christopher-peters-dev/investment-platform/common";
import type { TransactionsViewModel } from "../viewmodels/TransactionsViewModel";
import { useTransactionDetails } from "../hooks/useTransactions";
import { formatTransactionDate } from "../formatting";
import { TransactionStatusBadge } from "../components/TransactionStatusBadge";
export function TransactionDetailsScreen({
  viewModel,
  transactionId,
  onBack,
  onViewInvestment,
}: {
  viewModel: TransactionsViewModel;
  transactionId: string;
  onBack: () => void;
  onViewInvestment: () => void;
}) {
  const { state, reload } = useTransactionDetails(viewModel, transactionId);
  return (
    <AppScreen>
      <AppHeader
        title="Transaction Details"
        onBack={onBack}
        backLabel="‹ Back to transactions"
      />
      {state.status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText tone="muted">Loading transaction details…</AppText>
        </View>
      )}
      {state.status === "error" && (
        <View style={styles.content}>
          <AppText accessibilityRole="alert">{state.message}</AppText>
          <AppButton title="Try again" onPress={reload} />
        </View>
      )}
      {state.status === "success" && (
        <ScrollView contentContainerStyle={styles.content}>
          <AppCard>
            <AppText variant="heading">
              {state.transaction.investmentName}
            </AppText>
            <AppText variant="title" style={styles.gap}>
              {formatRupees(state.transaction.amount)}
            </AppText>
            <AppDivider />
            <Detail label="Type" value={state.transaction.type} />
            <Detail
              label="Date"
              value={formatTransactionDate(state.transaction.date)}
            />
            <AppText tone="muted" style={styles.gap}>
              Status
            </AppText>
            <TransactionStatusBadge status={state.transaction.status} />
            <Detail label="Reference ID" value={state.transaction.reference} />
          </AppCard>
          <AppButton title="View Investment" onPress={onViewInvestment} />
          <AppText variant="caption" tone="muted">
            Demonstration only. Investment navigation will be connected later.
          </AppText>
        </ScrollView>
      )}
    </AppScreen>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.gap}>
      <AppText tone="muted" variant="caption">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  gap: { marginTop: spacing.lg },
});
