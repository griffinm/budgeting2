import { useEffect, useState } from "react";
import { format as formatDate } from 'date-fns';
import {
  getIncomeMovingAverage,
  getMonthlyTransactions,
  getSpendMovingAverage,
} from '@/api';
import { Transaction, TransactionType } from '@/utils/types';

interface useTransactionTrendsReturn {
  currentMonthExpenses: MonthlyTransactions;
  currentMonthIncome: MonthlyTransactions;
  currentMonthSpendMovingAverage: SpendMovingAverage[];
  currentMonthSpendMovingAverageLoading: boolean;
  currentMonthIncomeMovingAverage: SpendMovingAverage[];
  currentMonthIncomeMovingAverageLoading: boolean;
}

export interface MonthlyTransactions {
  transactionType: TransactionType;
  transactions: Transaction[];
  loading: boolean;
}

export interface SpendMovingAverage {
  dayOfMonth: number;
  dayAverage: number;
  cumulativeTotal: number;
  cumulativeAveragePerDay: number;
}

const defaultMonthlyTransactions: MonthlyTransactions = {
  transactionType: 'expense',
  transactions: [],
  loading: true,
};

export function useTransactionTrends(): useTransactionTrendsReturn {
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<MonthlyTransactions>(defaultMonthlyTransactions);
  const [currentMonthIncome, setCurrentMonthIncome] = useState<MonthlyTransactions>(defaultMonthlyTransactions);
  const [currentMonthSpendMovingAverage, setCurrentMonthSpendMovingAverage] = useState<SpendMovingAverage[]>([]);
  const [currentMonthIncomeMovingAverage, setCurrentMonthIncomeMovingAverage] = useState<SpendMovingAverage[]>([]);
  const [currentMonthSpendMovingAverageLoading, setCurrentMonthSpendMovingAverageLoading] = useState<boolean>(true);
  const [currentMonthIncomeMovingAverageLoading, setCurrentMonthIncomeMovingAverageLoading] = useState<boolean>(true);

  const date = new Date();
  const currentMonth = parseInt(formatDate(date, 'M'));
  const currentYear = parseInt(formatDate(date, 'yyyy'));

  useEffect(() => {
    // Current month expenses
    getMonthlyTransactions({ transactionType: 'expense', month: currentMonth, year: currentYear }).then((response) => {
      setCurrentMonthExpenses({
        transactionType: 'expense',
        transactions: response,
        loading: false,
      });
    });

    // Current month income
    getMonthlyTransactions({ transactionType: 'income', month: currentMonth, year: currentYear }).then((response) => {
      setCurrentMonthIncome({
        transactionType: 'income',
        transactions: response,
        loading: false,
      });
    });

    // Current month spend moving average
    getSpendMovingAverage().then((response) => {
      setCurrentMonthSpendMovingAverage(response);
      setCurrentMonthSpendMovingAverageLoading(false);
    });

    // Current month income moving average
    getIncomeMovingAverage().then((response) => {
      setCurrentMonthIncomeMovingAverage(response);
      setCurrentMonthIncomeMovingAverageLoading(false);
    });
  }, [currentMonth, currentYear]);

  return {
    currentMonthExpenses,
    currentMonthIncome,
    currentMonthSpendMovingAverage,
    currentMonthIncomeMovingAverage,
    currentMonthSpendMovingAverageLoading,
    currentMonthIncomeMovingAverageLoading,
  };
}
