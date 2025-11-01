import { ColorBox } from "@/components/ColorBox";
import { Card, Group, Text } from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconTrendingUp } from "@tabler/icons-react";
import { getPercentChangeForCurrentDay } from "@/utils/chartUtils";
import { MonthlyTransactions } from "./useTransactionTrends";

export function MoMTrends({
  currentMonthExpenses,
  previousMonthExpenses,
  currentMonthIncome,
  previousMonthIncome,
}: {
  loading: boolean;
  currentMonthExpenses: MonthlyTransactions;
  previousMonthExpenses: MonthlyTransactions;
  currentMonthIncome: MonthlyTransactions;
  previousMonthIncome: MonthlyTransactions;
}) {
  const loading = currentMonthExpenses.loading || previousMonthExpenses.loading || currentMonthIncome.loading || previousMonthIncome.loading;

  if (loading) {
    return;
  }
  const incomeChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthIncome.transactions,
    transactionsLastMonth: previousMonthIncome.transactions,
    currentDay: new Date().getDate(),
    transactionType: 'income',
  });
  const expenseChange = getPercentChangeForCurrentDay({
    transactionsThisMonth: currentMonthExpenses.transactions,
    transactionsLastMonth: previousMonthExpenses.transactions,
    currentDay: new Date().getDate(),
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
        <Text fw={600}>Transaction Trends - Month over Month</Text>
      </Group>
      <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2">
        <ColorBox>
          <div className="flex flex-col gap-2 justify-between items-center p-4">
            <h2 className="text-lg text-gray-500">{expenseText}</h2>
            <div className="text-3xl font-bold text-gray-500 flex flex-row gap-2">
              {expenseArrow} {expenseChange + '%'}
            </div>
          </div>
        </ColorBox>
        <ColorBox>
          <div className="flex flex-col gap-2 justify-between items-center p-4">
            <h2 className="text-lg text-gray-500">{incomeText}</h2>
            <div className="text-3xl font-bold text-gray-500 flex flex-row gap-2">
              {incomeArrow} {incomeChange + '%'}
            </div>
          </div>
        </ColorBox>
      </div>
    </Card>
  
  )
}
