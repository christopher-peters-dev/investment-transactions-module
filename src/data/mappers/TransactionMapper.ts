import { AppError } from "@christopher-peters-dev/investment-platform/common";
import type { Transaction } from "../../domain/entities/Transaction";
export function mapTransaction(raw: unknown): Transaction {
  if (!raw || typeof raw !== "object")
    throw new AppError("Invalid transaction.", "INVALID_DATA");
  const dto = raw as Record<string, unknown>;
  if (
    typeof dto.id !== "string" ||
    !dto.id ||
    typeof dto.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dto.date) ||
    !Number.isFinite(Date.parse(dto.date)) ||
    (dto.type !== "Investment" && dto.type !== "Withdrawal") ||
    typeof dto.investment_name !== "string" ||
    !dto.investment_name ||
    typeof dto.amount !== "number" ||
    !Number.isFinite(dto.amount) ||
    dto.amount <= 0 ||
    (dto.status !== "Completed" && dto.status !== "Pending") ||
    typeof dto.reference !== "string" ||
    !dto.reference
  )
    throw new AppError("Invalid transaction data.", "INVALID_DATA");
  return {
    id: dto.id,
    date: dto.date,
    type: dto.type,
    investmentName: dto.investment_name,
    amount: dto.amount,
    status: dto.status,
    reference: dto.reference,
  };
}
