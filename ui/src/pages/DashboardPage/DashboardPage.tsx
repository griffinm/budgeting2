import { useEffect } from 'react';
import { urls } from '@/utils/urls';
import { MonthlySpend } from '@/components/MonthlySpend';
import { useTransactionTrends } from './useTransactionTrends';
import { DashboardCard } from './DashboardCard';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';

export default function DashboardPage() {
  const { 
    profitAndLoss,
    profitAndLossLoading,
    monthsBack,
    setMonthsBack: setProfitAndLossMonthsBack,
  } = useProfitAndLoss();

  const {
    currentMonthExpenses,
    currentMonthIncome,
    previousMonthExpenses,
    previousMonthIncome,
    averageExpense,
    averageIncome,
    expenseMonthsBack,
    incomeMonthsBack,
    setMonthsBack,
  } = useTransactionTrends();
  const loading = currentMonthExpenses.loading || currentMonthIncome.loading || previousMonthExpenses.loading || previousMonthIncome.loading;

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <DashboardCard
          currentMonthTransactions={currentMonthExpenses.transactions}
          previousMonthTransactions={previousMonthExpenses.transactions}
          transactionType="expense"
          loading={loading}
        />
        <DashboardCard
          currentMonthTransactions={currentMonthIncome.transactions}
          previousMonthTransactions={previousMonthIncome.transactions}
          transactionType="income"
          loading={loading}
        />
      </div>
      
      <ProfitAndLoss
        profitAndLoss={profitAndLoss}
        monthsBack={monthsBack}
        setMonthsBack={setProfitAndLossMonthsBack}
        loading={profitAndLossLoading}
      />

      <MonthlySpend
        currentMonthExpenses={currentMonthExpenses.transactions}
        currentMonthIncome={currentMonthIncome.transactions}
        previousMonthExpenses={previousMonthExpenses.transactions}
        previousMonthIncome={previousMonthIncome.transactions}
        loading={loading}
        averageExpense={averageExpense}
        averageIncome={averageIncome}
        expenseMonthsBack={expenseMonthsBack}
        incomeMonthsBack={incomeMonthsBack}
        setMonthsBack={setMonthsBack}
      />
    </div>
  );
}
