import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import {
  AppCard,
  AppText,
  spacing,
} from "@christopher-peters-dev/investment-platform/design-system";
import { formatRupees } from "@christopher-peters-dev/investment-platform/common";
import type { Transaction } from "../../domain/entities/Transaction";
import { formatTransactionDate } from "../formatting";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
export function TransactionCard({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"View transaction " + transaction.reference}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard>
        <View style={styles.row}>
          <AppText variant="heading" style={styles.name}>
            {transaction.investmentName}
          </AppText>
          <AppText variant="heading">
            {formatRupees(transaction.amount)}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText tone="muted">{transaction.type}</AppText>
          <AppText tone="muted" variant="caption">
            {formatTransactionDate(transaction.date)}
          </AppText>
        </View>
        <TransactionStatusBadge status={transaction.status} />
      </AppCard>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  name: { flex: 1 },
  pressed: { opacity: 0.75 },
});
