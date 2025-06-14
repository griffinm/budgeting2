import { Transaction, TransactionType } from "@/utils/types";

export interface DailyTotal {
  currentMonth: number;
  previousMonth: number;
  day: number;
}

export function transactionArrayToDailySeries({
  currentMonthTransactions,
  previousMonthTransactions,
  currentMonth,
  currentYear,
  transactionType,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  transactionType: TransactionType;
}): DailyTotal[] {
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dailyTotals: DailyTotal[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentMonthToDayTotal = getDailyRunningTotal({
      transactions: currentMonthTransactions,
      toDay: day,
      transactionType,
    });

    const previousMonthToDayTotal = getDailyRunningTotal({
      transactions: previousMonthTransactions,
      toDay: day,
      transactionType,
    });

    dailyTotals.push({
      currentMonth: currentMonthToDayTotal,
      previousMonth: previousMonthToDayTotal,
      day: day,
    });
  }

  return dailyTotals;
}

function getDailyRunningTotal({
  transactions,
  toDay,
  transactionType,
}: {
  transactions: Transaction[];
  toDay: number;
  transactionType: TransactionType;
}): number {
  const t = transactions
    .filter((transaction) => {
      const transactionDay = parseInt(transaction.date.split("-")[2].split("T")[0])
      return transactionDay <= toDay && transaction.transactionType === transactionType;
    })
    const total = t.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return Math.round(total * 100) / 100;
}

export function getPercentChangeForCurrentDay({
  transactionsThisMonth,
  transactionsLastMonth,
  currentDay,
  transactionType,
}: {
  transactionsThisMonth: Transaction[];
  transactionsLastMonth: Transaction[];
  currentDay: number;
  transactionType: TransactionType;
}): number {
  const totalThisMonth = getDailyRunningTotal({
    transactions: transactionsThisMonth,
    toDay: currentDay,
    transactionType,
  });
  const totalLastMonth = getDailyRunningTotal({
    transactions: transactionsLastMonth,
    toDay: currentDay,
    transactionType,
  });

  const change = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
  return Math.round(change * 10) / 10;
}
