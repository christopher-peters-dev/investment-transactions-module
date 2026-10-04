// These imports must remain illegal. tsc fails if a package starts exposing them.
// @ts-expect-error platform implementation is not a supported export
import type { Container } from "@christopher-peters-dev/investment-platform/src/di/container";
// @ts-expect-error only the public common path is supported
import type { Result } from "@christopher-peters-dev/investment-platform/common/Result";
// @ts-expect-error feature implementation is private
import type { TransactionRepositoryImpl } from "@company/investment-transactions/src/data/repositories/TransactionRepositoryImpl";
export type ForbiddenImports = [
  Container,
  Result<unknown>,
  TransactionRepositoryImpl,
];
