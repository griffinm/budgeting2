import { useEffect, useState } from "react";
import { format as formatDate } from 'date-fns';
import { getTransactions } from '@/api';
import { Transaction, TransactionType } from '@/utils/types';

export interface MonthlyTransactions {
  transactionType: TransactionType;
  transactions: Transaction[];
  loading: boolean;
}

export function useCurrentMonthTransactions(transactionType: TransactionType): MonthlyTransactions {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const date = new Date();
  const currentMonth = parseInt(formatDate(date, 'M'));
  const currentYear = parseInt(formatDate(date, 'yyyy'));

  useEffect(() => {
    setLoading(true);
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date();
    
    getTransactions({
      params: {
        transaction_type: transactionType,
        start_date: formatDate(startDate, 'yyyy-MM-dd'),
        end_date: formatDate(endDate, 'yyyy-MM-dd'),
        per_page: 1000, // Get all transactions for the month
      }
    }).then((response) => {
      setTransactions(response.items);
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });
  }, [currentMonth, currentYear, transactionType]);

  return {
    transactionType,
    transactions,
    loading,
  };
}

