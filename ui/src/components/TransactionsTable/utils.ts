import { Merchant, Transaction } from "@/utils/types";

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

export function getAvatarAlt(merchant: Merchant) {
  const name = merchant.customName || merchant.name;
  // if the name is 2 or more words, use first letter of the first 2 words
  if (name.split(' ').length >= 2) {
    return name.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
  }

  // if the name is 1 word, use the first 2 letters
  if (name.split(' ').length === 1) {
    return name.substring(0, 2);
  }
}
