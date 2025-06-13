import { Transaction, TransactionType } from "@/utils/types";
import { format as formatDate } from "date-fns";

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

    return total;
}
