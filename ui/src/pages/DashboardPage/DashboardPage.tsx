import { useEffect } from 'react';
import { urls } from '@/utils/urls';
import { MonthlySpend } from '@/components/MonthlySpend';
import { useTransactionTrends } from './useTransactionTrends';
import { DashboardCard } from './DashboardCard';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { AccountBalances } from './AccountBalances';
import { Card } from '@mantine/core';

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

  const { accountBalances, loading: accountBalancesLoading } = useAccountBalances();

  const loading = currentMonthExpenses.loading || currentMonthIncome.loading || previousMonthExpenses.loading || previousMonthIncome.loading;

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <AccountBalances accountBalances={accountBalances} loading={accountBalancesLoading} />
      </div>
      <Card className="border border-gray-200 rounded-md p-4 shadow-md mb-4">
        <h2 className="text-2xl mb-4">Transaction Trends</h2>
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
      </Card>
      
      <Card className="mb-4">
        <ProfitAndLoss
          profitAndLoss={profitAndLoss}
          monthsBack={monthsBack}
          setMonthsBack={setProfitAndLossMonthsBack}
          loading={profitAndLossLoading}
        />
      </Card>

      <div>
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
    </div>
  );
}
