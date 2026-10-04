export interface TransactionRemoteDataSource {
  getTransactions(): Promise<readonly unknown[]>;
}
