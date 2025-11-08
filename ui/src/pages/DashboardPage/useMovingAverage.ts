import { useEffect, useState } from "react";
import { format as formatDate } from 'date-fns';
import { getIncomeMovingAverage, getSpendMovingAverage, SpendMovingAverage } from '@/api';
import { TransactionType } from '@/utils/types';

export function useMovingAverage(transactionType: TransactionType) {
  const [data, setData] = useState<SpendMovingAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const date = new Date();
  const currentMonth = parseInt(formatDate(date, 'M'));
  const currentYear = parseInt(formatDate(date, 'yyyy'));

  useEffect(() => {
    setLoading(true);
    const fetchFn = transactionType === 'expense' 
      ? getSpendMovingAverage 
      : getIncomeMovingAverage;

    fetchFn().then((response) => {
      setData(response);
      setLoading(false);
    });
  }, [currentMonth, currentYear, transactionType]);

  return { data, loading };
}

