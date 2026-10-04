const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export const formatTransactionDate = (iso: string): string =>
  formatter.format(new Date(iso + "T00:00:00Z"));
