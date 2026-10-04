import React from "react";
import { View, StyleSheet } from "react-native";
import {
  AppText,
  colors,
  spacing,
  radius,
} from "@christopher-peters-dev/investment-platform/design-system";
import type { TransactionStatus } from "../../domain/entities/Transaction";
export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  return (
    <View
      style={[
        styles.badge,
        status === "Completed" ? styles.completed : styles.pending,
      ]}
    >
      <AppText
        variant="caption"
        tone={status === "Completed" ? "gain" : "default"}
      >
        {status}
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  completed: { backgroundColor: colors.primarySoft },
  pending: { backgroundColor: colors.accent },
});
