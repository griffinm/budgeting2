import { useEffect, useState } from "react";
import {
  format as formatDate,
  subMonths,
} from 'date-fns';
import {
  getIncomeMovingAverage,
  getMonthlyTransactions,
  getSpendMovingAverage,
} from '@/api';
import { Transaction, TransactionType } from '@/utils/types';

interface useTransactionTrendsReturn {
  currentMonthExpenses: MonthlyTransactions;
  currentMonthIncome: MonthlyTransactions;
  previousMonthExpenses: MonthlyTransactions;
  previousMonthIncome: MonthlyTransactions;
  expenseMonthsBack: number;
  incomeMonthsBack: number;
  setMonthsBack: ({ monthsBack, transactionType }: { monthsBack: number, transactionType: TransactionType }) => void;
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
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<MonthlyTransactions>(defaultMonthlyTransactions);
  const [previousMonthIncome, setPreviousMonthIncome] = useState<MonthlyTransactions>(defaultMonthlyTransactions);
  const [expenseMonthsBack, setExpenseMonthsBack] = useState<number>(6);
  const [incomeMonthsBack, setIncomeMonthsBack] = useState<number>(6);
  const [currentMonthSpendMovingAverage, setCurrentMonthSpendMovingAverage] = useState<SpendMovingAverage[]>([]);
  const [currentMonthIncomeMovingAverage, setCurrentMonthIncomeMovingAverage] = useState<SpendMovingAverage[]>([]);
  const [currentMonthSpendMovingAverageLoading, setCurrentMonthSpendMovingAverageLoading] = useState<boolean>(true);
  const [currentMonthIncomeMovingAverageLoading, setCurrentMonthIncomeMovingAverageLoading] = useState<boolean>(true);

  const date = new Date();
  const currentMonth = parseInt(formatDate(date, 'M'));
  const currentYear = parseInt(formatDate(date, 'yyyy'));
  const previousMonth = parseInt(formatDate(subMonths(date, 1), 'M'));
  const previousYear = parseInt(formatDate(subMonths(date, 1), 'yyyy'));

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

    // Previous month expenses
    getMonthlyTransactions({ transactionType: 'expense', month: previousMonth, year: previousYear }).then((response) => {
      setPreviousMonthExpenses({
        transactionType: 'expense',
        transactions: response,
        loading: false,
      });
    });

    // Previous month income
    getMonthlyTransactions({ transactionType: 'income', month: previousMonth, year: previousYear }).then((response) => {
      setPreviousMonthIncome({
        transactionType: 'income',
        transactions: response,
        loading: false,
      });
    });
  }, [currentMonth, currentYear, previousMonth, previousYear]);

  const setMonthsBack = ({ monthsBack, transactionType }: { monthsBack: number, transactionType: TransactionType }) => {
    if (transactionType === 'expense') {
      setExpenseMonthsBack(monthsBack);
    } else {
      setIncomeMonthsBack(monthsBack);
    }
  };

  return {
    currentMonthExpenses,
    currentMonthIncome,
    previousMonthExpenses,
    previousMonthIncome,
    currentMonthSpendMovingAverage,
    expenseMonthsBack,
    incomeMonthsBack,
    currentMonthIncomeMovingAverage,
    currentMonthSpendMovingAverageLoading,
    currentMonthIncomeMovingAverageLoading,
    setMonthsBack,
  };
}
