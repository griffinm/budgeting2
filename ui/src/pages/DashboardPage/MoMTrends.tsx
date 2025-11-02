import { ColorBox } from "@/components/ColorBox";
import { Card, Group, Text } from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconTrendingUp } from "@tabler/icons-react";
import { getDailyRunningTotal, getPercentChangeForCurrentDay } from "@/utils/chartUtils";
import { MovingAverage } from "@/utils/types";
import { getAverageForCurrentDay } from "@/utils/movingAverageUtils";
import { Currency } from "@/components/Currency";
import { MonthlyTransactions } from "./useCurrentMonthTransactions";

export function MoMTrends({
  currentMonthExpenses,
  currentMonthIncome,
  currentMonthIncomeMovingAverage,
  currentMonthSpendMovingAverage,
  currentMonthSpendMovingAverageLoading,
  currentMonthIncomeMovingAverageLoading,
}: {
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
  const currentDay = new Date().getDate();
  const incomeChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthIncome.transactions,
    averageSpendOnCurrentDay: getAverageForCurrentDay(currentMonthIncomeMovingAverage)?.cumulativeAveragePerDay || 0,
    currentDay: currentDay,
    transactionType: 'income',
  });
  const expenseChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthExpenses.transactions,
    averageSpendOnCurrentDay: getAverageForCurrentDay(currentMonthSpendMovingAverage)?.cumulativeAveragePerDay || 0,
    currentDay: currentDay,
    transactionType: 'expense',
  });
 
  const currentExpense = getDailyRunningTotal({
    transactions: currentMonthExpenses.transactions,
    toDay: currentDay,
    transactionType: 'expense',
  });
  const currentIncome = getDailyRunningTotal({
    transactions: currentMonthIncome.transactions,
    toDay: currentDay,
    transactionType: 'income',
  });

  const incomeArrowDirection = incomeChange > 0 ? 'up' : 'down';
  const expenseArrowDirection = expenseChange > 0 ? 'down' : 'up';

  const arrowSize = 40;
  const incomeArrow = incomeArrowDirection === 'up' ? <IconArrowUp size={arrowSize} color="green" /> : <IconArrowDown size={arrowSize} color="red" />;
  const expenseArrow = expenseArrowDirection === 'up' ? <IconArrowDown size={arrowSize} color="green" /> : <IconArrowUp size={arrowSize} color="red" />;
  const incomeText = incomeChange > 0 ? 'Income Is Up' : 'Income Is Down';
  const expenseText = expenseChange > 0 ? 'Expenses Are Up' : 'Expenses Are Down';
  const expenseAverageForToday = getAverageForCurrentDay(currentMonthSpendMovingAverage)?.cumulativeAveragePerDay || 0;
  const incomeAverageForToday = getAverageForCurrentDay(currentMonthIncomeMovingAverage)?.cumulativeAveragePerDay || 0;

  return (  
    <Card>
      <Group mb="md">
        <IconTrendingUp size={20} />
        <Text fw={600}>Transaction Trends</Text>
      </Group>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <ColorBox>
          <div className="flex flex-col gap-2 justify-between items-center p-4">
            <h2 className="text-lg text-gray-500">{expenseText}</h2>
            <div className="text-3xl font-bold text-gray-500 flex flex-row gap-2">
              {expenseArrow} {Math.abs(expenseChange || 0) + '%'}
            </div>
            <Text size="sm" c="dimmed" ta="center">
              Average By This Day: <Currency amount={expenseAverageForToday} applyColor={false} useBold={false} showCents={false} />
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
              {incomeArrow} {Math.abs(incomeChange || 0) + '%'}
            </div>
            <Text size="sm" c="dimmed" ta="center">
              Average By This Day: <Currency amount={incomeAverageForToday} applyColor={false} useBold={false} showCents={false} />
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
