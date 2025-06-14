import { useEffect, useState } from "react";
import {
  format as formatDate,
  subMonths,
} from 'date-fns';
import {
  averageForMonthsBack,
  getMonthlyTransactions,
} from '@/api';
import { Transaction, TransactionType } from '@/utils/types';

interface useTransactionTrendsReturn {
  currentMonthExpenses: MonthlyTransactions;
  currentMonthIncome: MonthlyTransactions;
  previousMonthExpenses: MonthlyTransactions;
  previousMonthIncome: MonthlyTransactions;
  averageExpense: number;
  averageIncome: number;
  expenseMonthsBack: number;
  incomeMonthsBack: number;
  setMonthsBack: ({ monthsBack, transactionType }: { monthsBack: number, transactionType: TransactionType }) => void;
}

export interface MonthlyTransactions {
  transactionType: TransactionType;
  transactions: Transaction[];
  loading: boolean;
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
  const [averageExpense, setAverageExpense] = useState<number>(0);
  const [averageIncome, setAverageIncome] = useState<number>(0);
  const [expenseMonthsBack, setExpenseMonthsBack] = useState<number>(6);
  const [incomeMonthsBack, setIncomeMonthsBack] = useState<number>(6);

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

  useEffect(() => {
    averageForMonthsBack({ monthsBack: expenseMonthsBack, transactionType: 'expense' }).then((response) => {
      setAverageExpense(response);
    });
  }, [expenseMonthsBack]);

  useEffect(() => {
    averageForMonthsBack({ monthsBack: incomeMonthsBack, transactionType: 'income' }).then((response) => {
      setAverageIncome(response);
    });
  }, [incomeMonthsBack]);

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
    averageExpense,
    averageIncome,
    expenseMonthsBack,
    incomeMonthsBack,
    setMonthsBack,
  };
}
