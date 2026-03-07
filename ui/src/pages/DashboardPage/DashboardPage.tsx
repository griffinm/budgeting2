import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { useCurrentMonthTransactions } from './useCurrentMonthTransactions';
import { useMovingAverage } from './useMovingAverage';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { AccountBalances } from './AccountBalances';
import { Text, Modal, Button, Stack, Paper } from '@mantine/core';
import { IconBuildingBank } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { DashboardSummary } from './DashboardSummary';
import { MonthlyTrends } from './MonthlyTrends';
import { CollapsibleCard } from '@/components/CollapsibleCard/CollapsibleCard';
import { getCurrentBalance } from './accountBalanceUtils';
import { getDailyRunningTotal, getPercentChangeForCurrentDay } from '@/utils/chartUtils';
import { getAverageForCurrentDay } from '@/utils/movingAverageUtils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(CurrentUserContext);
  const [showLinkAccountsModal, setShowLinkAccountsModal] = useState(user?.linkedAccounts === 0);

  const {
    profitAndLoss,
    profitAndLossLoading,
    monthsBack,
    setMonthsBack: setProfitAndLossMonthsBack,
  } = useProfitAndLoss();

  const currentMonthExpenses = useCurrentMonthTransactions('expense');
  const currentMonthIncome = useCurrentMonthTransactions('income');
  const { data: spendMovingAverage, loading: spendMovingAverageLoading } = useMovingAverage('expense');
  const { data: incomeMovingAverage, loading: incomeMovingAverageLoading } = useMovingAverage('income');

  const { accountBalances, loading: accountBalancesLoading } = useAccountBalances();

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  const handleLinkAccounts = () => {
    setShowLinkAccountsModal(false);
    navigate(urls.accounts.path());
  };

  // Computed values for DashboardSummary
  const netWorth = accountBalances.reduce((sum, ab) => {
    const balance = getCurrentBalance(ab);
    const type = ab.plaidAccount.accountType;
    if (type === 'credit' || type === 'loan') {
      return sum - Math.abs(balance);
    }
    return sum + balance;
  }, 0);

  const currentDay = new Date().getDate();

  const expensesThisMonth = getDailyRunningTotal({
    transactions: currentMonthExpenses.transactions,
    toDay: currentDay,
    transactionType: 'expense',
  });

  const incomeThisMonth = getDailyRunningTotal({
    transactions: currentMonthIncome.transactions,
    toDay: currentDay,
    transactionType: 'income',
  });

  const profitThisMonth = incomeThisMonth - expensesThisMonth;

  const expenseAvgByToday = getAverageForCurrentDay(spendMovingAverage)?.cumulativeTotal || 0;
  const incomeAvgByToday = getAverageForCurrentDay(incomeMovingAverage)?.cumulativeTotal || 0;

  const expenseChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthExpenses.transactions,
    averageSpendOnCurrentDay: expenseAvgByToday,
    currentDay,
    transactionType: 'expense',
  });

  const incomeChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthIncome.transactions,
    averageSpendOnCurrentDay: incomeAvgByToday,
    currentDay,
    transactionType: 'income',
  });

  const avgProfitByToday = incomeAvgByToday - expenseAvgByToday;
  const profitChange = avgProfitByToday !== 0
    ? Math.round(((profitThisMonth - avgProfitByToday) / Math.abs(avgProfitByToday)) * 1000) / 10
    : 0;

  const summaryLoading = currentMonthExpenses.loading || currentMonthIncome.loading || spendMovingAverageLoading || incomeMovingAverageLoading || accountBalancesLoading;

  return (
    <div className="h-full flex flex-col">
      <Modal
        opened={showLinkAccountsModal}
        onClose={() => {}} // Non-dismissible - user must click the button
        title="Welcome! Let's Get Started"
        centered
        size="md"
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <div className="flex justify-center mb-3">
            <IconBuildingBank size={64} stroke={1.5} />
          </div>
          <Text size="md" ta="center">
            To start tracking your finances, you'll need to link your bank accounts.
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Connect your accounts securely through Plaid to automatically import your transactions and see your financial overview.
          </Text>
          <Button
            fullWidth
            size="md"
            mt="md"
            onClick={handleLinkAccounts}
          >
            Link Your Accounts
          </Button>
        </Stack>
      </Modal>

      <div className="flex flex-col gap-4">
        <DashboardSummary
          netWorth={netWorth}
          expensesThisMonth={expensesThisMonth}
          incomeThisMonth={incomeThisMonth}
          profitThisMonth={profitThisMonth}
          expenseChange={expenseChange}
          incomeChange={incomeChange}
          profitChange={profitChange}
          expenseAvgByToday={expenseAvgByToday}
          incomeAvgByToday={incomeAvgByToday}
          loading={summaryLoading}
        />

        <CollapsibleCard title="Account Balances" initialState="collapsed">
          <AccountBalances accountBalances={accountBalances} loading={accountBalancesLoading} />
        </CollapsibleCard>

        <Paper>
          <ProfitAndLoss
            profitAndLoss={profitAndLoss}
            monthsBack={monthsBack}
            setMonthsBack={setProfitAndLossMonthsBack}
            loading={profitAndLossLoading}
          />
        </Paper>

        <Paper>
          <MonthlyTrends
            expenseTransactions={currentMonthExpenses.transactions}
            incomeTransactions={currentMonthIncome.transactions}
            spendMovingAverage={spendMovingAverage}
            incomeMovingAverage={incomeMovingAverage}
          />
        </Paper>
      </div>
    </div>
  );
}
