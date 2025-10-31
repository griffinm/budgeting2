import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { useTransactionTrends } from './useTransactionTrends';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { AccountBalances } from './AccountBalances';
import { Card, Group, Text, Modal, Button, Stack } from '@mantine/core';
import { IconWallet, IconCalculator, IconCalendar, IconBuildingBank } from '@tabler/icons-react';
import { MonthlyLineChart } from '@/components/MonthlySpend/MonthlyLineChart';
import { MoMTrends } from './MoMTrends';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';

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

  const handleLinkAccounts = () => {
    setShowLinkAccountsModal(false);
    navigate(urls.accounts.path());
  };

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
          loading={currentMonthExpenses.transactions.length === 0 || previousMonthExpenses.transactions.length === 0 || currentMonthIncome.transactions.length === 0 || previousMonthIncome.transactions.length === 0}
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
