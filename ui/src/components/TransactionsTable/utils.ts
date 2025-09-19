import { Transaction } from "@/utils/types";

export interface GroupedTransactions {
  date: string;
  transactions: Transaction[];
}

export function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groupsMap = new Map<string, Transaction[]>();
  
  transactions.forEach((transaction) => {
    const date = transaction.date;
    if (groupsMap.has(date)) {
      groupsMap.get(date)!.push(transaction);
    } else {
      groupsMap.set(date, [transaction]);
    }
  });
  
  return Array.from(groupsMap.entries())
    .map(([date, transactions]) => ({ date, transactions }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
