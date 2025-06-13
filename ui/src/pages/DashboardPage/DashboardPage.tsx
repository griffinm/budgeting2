import { useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { MonthlySpend } from '@/components/MonthlySpend';
import { useTransactionTrends } from './useTransactionTrends';


export default function DashboardPage() {
  const {
    currentMonthExpenses,
    currentMonthIncome,
    previousMonthExpenses,
    previousMonthIncome,
  } = useTransactionTrends();
  const loading = currentMonthExpenses.loading || currentMonthIncome.loading || previousMonthExpenses.loading || previousMonthIncome.loading;

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  return (
    <div>
      <MonthlySpend
        currentMonthExpenses={currentMonthExpenses.transactions}
        currentMonthIncome={currentMonthIncome.transactions}
        previousMonthExpenses={previousMonthExpenses.transactions}
        previousMonthIncome={previousMonthIncome.transactions}
        loading={loading}
      />
    </div>
  );
}
