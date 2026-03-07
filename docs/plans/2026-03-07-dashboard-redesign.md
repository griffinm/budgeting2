# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the dashboard with summary stat cards at top and cleaner detail sections below, borrowing design patterns from the merchant page.

**Architecture:** Replace the current vertical stack of Card components with: (1) a 4-card SimpleGrid summary row at top using the merchant SpendSummary pattern, (2) a CollapsibleCard for account balances, (3) a restyled P&L section in Paper, and (4) a tabbed monthly trends section combining spend/income charts. The MoM Trends section is removed — its data merges into the summary cards.

**Tech Stack:** React 19, TypeScript, Mantine v8 (Paper, SimpleGrid, SegmentedControl, Group, Text), Tailwind CSS v4, Mantine Charts, Tabler Icons.

---

### Task 1: Create DashboardSummary Component

**Files:**
- Create: `ui/src/pages/DashboardPage/DashboardSummary.tsx`

**Context:** This component renders 4 stat cards in a SimpleGrid, following the pattern from `ui/src/pages/MerchantPage/SpendSummary.tsx`. It receives all needed data as props.

**Step 1: Create the DashboardSummary component**

```tsx
import { Paper, SimpleGrid, Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { AccountBalance } from "@/utils/types";
import { Currency } from "@/components/Currency";
import { getCurrentBalance } from "./accountBalanceUtils";
import { Loading } from "@/components/Loading";

function formatDollars(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

interface DashboardSummaryProps {
  netWorth: number;
  expensesThisMonth: number;
  incomeThisMonth: number;
  profitThisMonth: number;
  expenseChange?: number;
  incomeChange?: number;
  profitChange?: number;
  expenseAvgByToday?: number;
  incomeAvgByToday?: number;
  loading: boolean;
}

export function DashboardSummary({
  netWorth,
  expensesThisMonth,
  incomeThisMonth,
  profitThisMonth,
  expenseChange,
  incomeChange,
  profitChange,
  expenseAvgByToday,
  incomeAvgByToday,
  loading,
}: DashboardSummaryProps) {
  if (loading) {
    return <Loading fullHeight={false} />;
  }

  const cards = [
    {
      title: "Net Worth",
      value: netWorth,
    },
    {
      title: "Expenses This Month",
      value: expensesThisMonth,
      diff: expenseChange,
      // For expenses: up is bad (red), down is good (teal)
      diffColorInverted: true,
      avgByToday: expenseAvgByToday,
      current: expensesThisMonth,
    },
    {
      title: "Income This Month",
      value: incomeThisMonth,
      diff: incomeChange,
      // For income: up is good (teal), down is bad (red)
      diffColorInverted: false,
      avgByToday: incomeAvgByToday,
      current: incomeThisMonth,
    },
    {
      title: "Profit This Month",
      value: profitThisMonth,
      diff: profitChange,
      diffColorInverted: false,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {cards.map((card) => {
        const diffColor = card.diff !== undefined
          ? (card.diffColorInverted
            ? (card.diff >= 0 ? "red" : "teal")
            : (card.diff >= 0 ? "teal" : "red"))
          : undefined;

        return (
          <Paper withBorder p="md" radius="md" key={card.title}>
            <Text size="sm" c="dimmed">{card.title}</Text>
            <Text size="xxl" fw={700} mt={4} style={{ fontSize: '1.75rem' }}>
              {formatDollars(card.value)}
            </Text>
            {card.diff !== undefined && (
              <Text size="xs" mt={4} c={diffColor} className="flex items-center gap-1">
                {card.diff >= 0
                  ? <IconTrendingUp size={14} />
                  : <IconTrendingDown size={14} />}
                {Math.abs(card.diff).toFixed(0)}% vs avg
              </Text>
            )}
            {card.avgByToday !== undefined && (
              <Text size="xs" c="dimmed" mt={2}>
                Avg by today: {formatDollars(card.avgByToday)}
              </Text>
            )}
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `cd ui && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to DashboardSummary

**Step 3: Commit**

```bash
git add ui/src/pages/DashboardPage/DashboardSummary.tsx
git commit -m "feat: add DashboardSummary stat cards component"
```

---

### Task 2: Restyle ProfitAndLoss Component

**Files:**
- Modify: `ui/src/pages/DashboardPage/ProfitAndLoss.tsx`

**Context:** Remove the Card wrapper and icon header. The component should now render just its content — the parent will wrap it in Paper. Add the month selector as an inline header like the merchant TrendChart pattern (see `ui/src/pages/MerchantPage/TrendChart.tsx:26-35`).

**Step 1: Update ProfitAndLoss to use TrendChart-style header**

Replace the return statement (lines 182-200) with:

```tsx
return (
  <div className="flex flex-col gap-2">
    <Group justify="space-between" align="flex-end" mb="md">
      <Text size="lg" fw={600}>Profit & Loss</Text>
      <Select
        value={monthsBack.toString()}
        onChange={(value) => setMonthsBack(parseInt(value || '12'))}
        data={[
          { value: '3', label: '3 Months' },
          { value: '6', label: '6 Months' },
          { value: '12', label: '12 Months' },
          { value: '24', label: '24 Months' },
        ]}
        size="xs"
        w={120}
      />
    </Group>
    {loading ? <Loading fullHeight={false} /> : renderData()}
  </div>
);
```

Also add `Group` to the Mantine imports at line 5:

```tsx
import { Group, Select, Table } from "@mantine/core";
```

And add `Text` import:

```tsx
import { Group, Select, Table, Text } from "@mantine/core";
```

**Step 2: Verify no TypeScript errors**

Run: `cd ui && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add ui/src/pages/DashboardPage/ProfitAndLoss.tsx
git commit -m "feat: restyle P&L with TrendChart-style header"
```

---

### Task 3: Create MonthlyTrends Tabbed Component

**Files:**
- Create: `ui/src/pages/DashboardPage/MonthlyTrends.tsx`

**Context:** Combines the two MonthlyLineChart instances (spend + income) into one section with a SegmentedControl toggle. Uses the same `MonthlyLineChart` component from `ui/src/components/MonthlySpend/MonthlyLineChart.tsx`.

**Step 1: Create the MonthlyTrends component**

```tsx
import { useState } from "react";
import { Group, SegmentedControl, Text } from "@mantine/core";
import { MonthlyLineChart } from "@/components/MonthlySpend/MonthlyLineChart";
import { MovingAverage, Transaction } from "@/utils/types";

export function MonthlyTrends({
  expenseTransactions,
  incomeTransactions,
  spendMovingAverage,
  incomeMovingAverage,
}: {
  expenseTransactions: Transaction[];
  incomeTransactions: Transaction[];
  spendMovingAverage: MovingAverage[];
  incomeMovingAverage: MovingAverage[];
}) {
  const [view, setView] = useState<string>("expense");

  return (
    <div className="flex flex-col gap-2">
      <Group justify="space-between" align="flex-end" mb="md">
        <Text size="lg" fw={600}>Monthly Trends</Text>
        <SegmentedControl
          size="xs"
          value={view}
          onChange={setView}
          data={[
            { label: "Spending", value: "expense" },
            { label: "Income", value: "income" },
          ]}
        />
      </Group>
      {view === "expense" ? (
        <MonthlyLineChart
          currentMonthTransactions={expenseTransactions}
          transactionMovingAverage={spendMovingAverage}
          transactionType="expense"
        />
      ) : (
        <MonthlyLineChart
          currentMonthTransactions={incomeTransactions}
          transactionMovingAverage={incomeMovingAverage}
          transactionType="income"
        />
      )}
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `cd ui && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add ui/src/pages/DashboardPage/MonthlyTrends.tsx
git commit -m "feat: add MonthlyTrends tabbed component"
```

---

### Task 4: Rewrite DashboardPage Layout

**Files:**
- Modify: `ui/src/pages/DashboardPage/DashboardPage.tsx`

**Context:** This is the main page component. It needs to:
1. Compute net worth from account balances using `getCurrentBalance` from `accountBalanceUtils.ts`
2. Compute expense/income/profit values and their % changes from existing hook data
3. Render DashboardSummary at top
4. Render AccountBalances in a CollapsibleCard (default collapsed)
5. Render P&L in a Paper
6. Render MonthlyTrends in a Paper
7. Remove MoMTrends import and usage
8. Remove Card/icon header patterns

**Step 1: Rewrite DashboardPage.tsx**

Replace the entire file content with:

```tsx
import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { useCurrentMonthTransactions } from './useCurrentMonthTransactions';
import { useMovingAverage } from './useMovingAverage';
import { useProfitAndLoss } from '@/hooks/useProfitAndLoss';
import { ProfitAndLoss } from './ProfitAndLoss';
import { useAccountBalances } from '@/hooks/useAccountBalance';
import { AccountBalances } from './AccountBalances';
import { DashboardSummary } from './DashboardSummary';
import { MonthlyTrends } from './MonthlyTrends';
import { Modal, Button, Stack, Text, Paper } from '@mantine/core';
import { IconBuildingBank } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
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

  // Compute summary values
  const summaryLoading = currentMonthExpenses.loading ||
    currentMonthIncome.loading ||
    spendMovingAverageLoading ||
    incomeMovingAverageLoading ||
    accountBalancesLoading;

  const currentDay = new Date().getDate();

  const netWorth = accountBalances.reduce((sum, ab) => sum + getCurrentBalance(ab), 0);

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

  // Profit change: compare this month's profit pace to average profit pace
  const avgProfitByToday = incomeAvgByToday - expenseAvgByToday;
  const profitChange = avgProfitByToday !== 0
    ? Math.round(((profitThisMonth - avgProfitByToday) / Math.abs(avgProfitByToday)) * 1000) / 10
    : 0;

  return (
    <div className="h-full flex flex-col">
      <Modal
        opened={showLinkAccountsModal}
        onClose={() => {}}
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
```

**Step 2: Verify no TypeScript errors**

Run: `cd ui && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Verify the app renders**

Run: `cd ui && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add ui/src/pages/DashboardPage/DashboardPage.tsx
git commit -m "feat: rewrite dashboard layout with summary cards and cleaner sections"
```

---

### Task 5: Delete MoMTrends

**Files:**
- Delete: `ui/src/pages/DashboardPage/MoMTrends.tsx`

**Step 1: Delete the file**

```bash
rm ui/src/pages/DashboardPage/MoMTrends.tsx
```

**Step 2: Verify no references remain**

Run: `grep -r "MoMTrends" ui/src/`
Expected: No output (no remaining imports or references)

**Step 3: Verify build still works**

Run: `cd ui && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add -A ui/src/pages/DashboardPage/MoMTrends.tsx
git commit -m "chore: remove MoMTrends component (data merged into summary cards)"
```

---

### Task 6: Visual Verification and Final Cleanup

**Step 1: Run the full TypeScript check**

Run: `cd ui && npx tsc --noEmit --pretty`
Expected: No errors

**Step 2: Run the build**

Run: `cd ui && npm run build`
Expected: Build succeeds with no warnings

**Step 3: Verify unused imports are cleaned up**

Check that `DashboardPage.tsx` has no unused imports (no `IconWallet`, `IconCalculator`, `IconCalendar`, `Card`, `Group` from old code).

**Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: dashboard redesign cleanup"
```
