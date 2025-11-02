import { MovingAverage, Transaction, TransactionType } from "@/utils/types";

export interface DailyTotal {
  currentMonth: number;
  previousMonth: number;
  day: number;
}

export function transactionArrayToDailySeries({
  currentMonthTransactions,
  transactionMovingAverage,
  currentMonth,
  currentYear,
  transactionType,
}: {
  currentMonthTransactions: Transaction[];
  transactionMovingAverage: MovingAverage[];
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

    const previousMonthToDayTotal = transactionMovingAverage?.find((item) => item.dayOfMonth === day)?.cumulativeTotal || 0;

    dailyTotals.push({
      currentMonth: currentMonthToDayTotal,
      previousMonth: previousMonthToDayTotal,
      day: day,
    });
  }

  return dailyTotals;
}

export function getDailyRunningTotal({
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
  averageSpendOnCurrentDay,
  currentDay,
  transactionType,
}: {
  transactionsThisMonth: Transaction[];
  averageSpendOnCurrentDay: number;
  currentDay: number;
  transactionType: TransactionType;
}): number {
  const totalThisMonth = getDailyRunningTotal({
    transactions: transactionsThisMonth,
    toDay: currentDay,
    transactionType,
  });

  const change = ((totalThisMonth - averageSpendOnCurrentDay) / averageSpendOnCurrentDay) * 100;
  const roundedChange = Math.round(change * 10) / 10;
  if (!isFinite(change)) {
    return 0;
  }
  return roundedChange || 0;
}
