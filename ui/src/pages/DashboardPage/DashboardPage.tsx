import { useEffect } from 'react';
import { urls } from '@/utils/urls';
import { useTransactionTrends } from './useTransactionTrends';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { AccountBalances } from './AccountBalances';
import { Card, Group, Text } from '@mantine/core';
import { IconWallet, IconCalculator, IconCalendar } from '@tabler/icons-react';
import { MonthlyLineChart } from '@/components/MonthlySpend/MonthlyLineChart';
import { MoMTrends } from './MoMTrends';

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

  

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      </div>
      
      <div className="flex flex-col gap-4">
        <Card>
          <Group mb="md">
            <IconWallet size={20} />
            <Text fw={600}>Account Balances</Text>
          </Group>
          <AccountBalances accountBalances={accountBalances} loading={accountBalancesLoading} />
        </Card>

        <MoMTrends
          currentMonthExpenses={currentMonthExpenses}
          previousMonthExpenses={previousMonthExpenses}
          currentMonthIncome={currentMonthIncome}
          previousMonthIncome={previousMonthIncome}
        />

        <Card>
          <Group mb="md">
            <IconCalculator size={20} />
            <Text fw={600}>Profit & Loss</Text>
          </Group>
          <ProfitAndLoss
            profitAndLoss={profitAndLoss}
            monthsBack={monthsBack}
            setMonthsBack={setProfitAndLossMonthsBack}
            loading={profitAndLossLoading}
          />
        </Card>

        <Card>
          <Group mb="md">
            <IconCalendar size={20} />
            <Text fw={600}>Monthly Spend</Text>
          </Group>
          <MonthlyLineChart
          currentMonthTransactions={currentMonthExpenses.transactions}
          previousMonthTransactions={previousMonthExpenses.transactions}
          transactionType="expense"
          average={averageExpense}
          monthsBack={expenseMonthsBack}
          onChangeMonthsBack={(value) => setMonthsBack({ monthsBack: value, transactionType: 'expense' })}
        />
        </Card>

        <Card>
          <Group mb="md">
            <IconCalendar size={20} />
            <Text fw={600}>Monthly Income</Text>
          </Group>
          <MonthlyLineChart
            currentMonthTransactions={currentMonthIncome.transactions}
            previousMonthTransactions={previousMonthIncome.transactions}
            transactionType="income"
            average={averageIncome}
            monthsBack={incomeMonthsBack}
            onChangeMonthsBack={(value) => setMonthsBack({ monthsBack: value, transactionType: 'income' })}
          />
        </Card>
      </div>
    </div>
  );
}
