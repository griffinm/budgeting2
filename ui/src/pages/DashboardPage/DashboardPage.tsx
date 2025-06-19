import { useEffect } from 'react';
import { urls } from '@/utils/urls';
import { MonthlySpend } from '@/components/MonthlySpend';
import { useTransactionTrends } from './useTransactionTrends';
import { getPercentChangeForCurrentDay } from '@/utils/chartUtils';
import { Blockquote } from '@mantine/core';
import { Transaction, TransactionType } from '@/utils/types';
import { Loading } from '@/components/Loading/Loading';


export default function DashboardPage() {
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
        <PerformanceCard
          currentMonthTransactions={currentMonthExpenses.transactions}
          previousMonthTransactions={previousMonthExpenses.transactions}
          transactionType="expense"
          loading={loading}
        />
        <PerformanceCard
          currentMonthTransactions={currentMonthIncome.transactions}
          previousMonthTransactions={previousMonthIncome.transactions}
          transactionType="income"
          loading={loading}
        />
      </div>

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

function PerformanceCard({
  currentMonthTransactions,
  previousMonthTransactions,
  transactionType,
  loading,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
  loading: boolean;
}) {
  const isNegativeGood = transactionType !== 'expense';
  const cardColor = isNegativeGood ? 'red' : 'green';

  return (
    <div className="max-w-xs">
    <Blockquote className="bg-gray-100 p-4 rounded-lg" color={cardColor}>
      <h3 className="text-md mb-2">
        {transactionType === 'expense' ? 'Expenses' : 'Income'} Performance MoM
      </h3>
      {loading && <Loading fullHeight={false} />}
      {!loading && (
        <p className="text-3xl text-gray-500 font-bold">
          {getPercentChangeForCurrentDay({
          transactionsThisMonth: currentMonthTransactions,
          transactionsLastMonth: previousMonthTransactions,
          currentDay: new Date().getDate(),
          transactionType,
        }) + '%'}
        </p>
      )}
    </Blockquote>
  </div>
  )
}
