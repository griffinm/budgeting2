import { MovingAverage, Transaction, TransactionType } from "@/utils/types";

export interface DailyTotal {
  currentMonth: number | null;
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
  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  for (let day = 1; day <= daysInMonth; day++) {
    // Only show current month data up to today
    const shouldShowCurrentMonth = !isCurrentMonth || day <= currentDay;
    
    const currentMonthToDayTotal = shouldShowCurrentMonth 
      ? getDailyRunningTotal({
          transactions: currentMonthTransactions,
          toDay: day,
          transactionType,
        })
      : null;

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
  // Get current month and year for validation
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  const t = transactions
    .filter((transaction) => {
      // Parse the date string to get year, month, and day
      // Format could be "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"
      const dateParts = transaction.date.split("T")[0].split("-");
      const transactionYear = parseInt(dateParts[0]);
      const transactionMonth = parseInt(dateParts[1]);
      const transactionDay = parseInt(dateParts[2]);
      
      // Ensure transaction is from current month/year and on or before toDay
      return (
        transactionYear === currentYear &&
        transactionMonth === currentMonth &&
        transactionDay <= toDay &&
        transaction.transactionType === transactionType
      );
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
