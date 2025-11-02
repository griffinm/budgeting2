import { ColorBox } from "@/components/ColorBox";
import { Card, Group, Text } from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconTrendingUp } from "@tabler/icons-react";
import { getDailyRunningTotal, getPercentChangeForCurrentDay } from "@/utils/chartUtils";
import { MonthlyTransactions } from "./useTransactionTrends";
import { MovingAverage } from "@/utils/types";
import { getAverageSpendOnCurrentDay } from "@/utils/movingAverageUtils";
import { Currency } from "@/components/Currency";

export function MoMTrends({
  currentMonthExpenses,
  currentMonthIncome,
  currentMonthIncomeMovingAverage,
  currentMonthSpendMovingAverage,
  currentMonthSpendMovingAverageLoading,
  currentMonthIncomeMovingAverageLoading,
}: {
  loading: boolean;
  currentMonthExpenses: MonthlyTransactions;
  currentMonthIncome: MonthlyTransactions;
  currentMonthIncomeMovingAverage: MovingAverage[];
  currentMonthSpendMovingAverage: MovingAverage[];
  currentMonthSpendMovingAverageLoading: boolean;
  currentMonthIncomeMovingAverageLoading: boolean;
}) {
  const loading = currentMonthExpenses.loading || 
    currentMonthIncome.loading || 
    currentMonthSpendMovingAverageLoading || 
    currentMonthIncomeMovingAverageLoading;

  if (loading) {
    return;
  }
  const incomeChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthIncome.transactions,
    averageSpendOnCurrentDay: getAverageSpendOnCurrentDay(currentMonthIncomeMovingAverage),
    currentDay: new Date().getDate(),
    transactionType: 'income',
  });
  const expenseChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthExpenses.transactions,
    averageSpendOnCurrentDay: getAverageSpendOnCurrentDay(currentMonthSpendMovingAverage),
    currentDay: new Date().getDate(),
    transactionType: 'expense',
  });
  const currentIncome = getDailyRunningTotal({
    transactions: currentMonthIncome.transactions,
    toDay: new Date().getDate(),
    transactionType: 'income',
  });
  const currentExpense = getDailyRunningTotal({
    transactions: currentMonthExpenses.transactions,
    toDay: new Date().getDate(),
    transactionType: 'expense',
  });

  const incomeArrowDirection = incomeChange > 0 ? 'up' : 'down';
  const expenseArrowDirection = expenseChange > 0 ? 'down' : 'up';

  const arrowSize = 40;
  const incomeArrow = incomeArrowDirection === 'up' ? <IconArrowUp size={arrowSize} color="green" /> : <IconArrowDown size={arrowSize} color="red" />;
  const expenseArrow = expenseArrowDirection === 'up' ? <IconArrowDown size={arrowSize} color="green" /> : <IconArrowUp size={arrowSize} color="red" />;
  const incomeText = incomeChange > 0 ? 'Income: Up' : 'Income: Down';
  const expenseText = expenseChange > 0 ? 'Expenses: Up' : 'Expenses: Down';

  return (  
    <Card>
      <Group mb="md">
        <IconTrendingUp size={20} />
        <Text fw={600}>Transaction Trends</Text>
      </Group>
      <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2">
        <ColorBox>
          <div className="flex flex-col gap-2 justify-between items-center p-4">
            <h2 className="text-lg text-gray-500">{expenseText}</h2>
            <div className="text-3xl font-bold text-gray-500 flex flex-row gap-2">
              {expenseArrow} {expenseChange + '%'}
            </div>
            <Text size="sm" c="dimmed" ta="center">
              Average: <Currency amount={getAverageSpendOnCurrentDay(currentMonthSpendMovingAverage)} applyColor={false} useBold={false} showCents={false} />
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Current: <Currency amount={currentExpense} applyColor={false} useBold={false} showCents={false} />
            </Text>
          </div>
        </ColorBox>
        <ColorBox>
          <div className="flex flex-col gap-2 justify-between items-center p-4">
            <h2 className="text-lg text-gray-500">{incomeText}</h2>
            <div className="text-3xl font-bold text-gray-500 flex flex-row gap-2">
              {incomeArrow} {incomeChange + '%'}
            </div>
            <Text size="sm" c="dimmed" ta="center">
              Average: <Currency amount={getAverageSpendOnCurrentDay(currentMonthIncomeMovingAverage)} applyColor={false} useBold={false} showCents={false} />
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Current: <Currency amount={currentIncome} applyColor={false} useBold={false} showCents={false} />
            </Text>
          </div>
        </ColorBox>
      </div>
    </Card>
  
  )
}
