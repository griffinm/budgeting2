import { MovingAverage, Transaction, TransactionType } from "@/utils/types";
import { LineChart } from "@mantine/charts";
import { transactionArrayToDailySeries } from "@/utils/chartUtils";

export function MonthlyLineChart({
  currentMonthTransactions,
  transactionMovingAverage,
  transactionType,
}: {
  currentMonthTransactions: Transaction[];
  transactionMovingAverage: MovingAverage[];
  transactionType: TransactionType;
}) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lineColor = transactionType === 'expense' ? 'red' : 'green';

  const dailyTotals = transactionArrayToDailySeries({
    currentMonthTransactions,
    transactionMovingAverage,
    currentMonth,
    currentYear,
    transactionType,
  });
  console.log(dailyTotals);
  return (
    <div className="flex flex-col gap-4">
      <LineChart
        withLegend
        h={350}
        data={dailyTotals}
        strokeWidth={3}
        dataKey="day"
        curveType="natural"
        withDots={false}
        yAxisLabel={transactionType === 'expense' ? 'Expenses' : 'Income'}
        xAxisLabel="Day of Month"
        tooltipAnimationDuration={200}
        valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        series={[
          { name: 'currentMonth', color: lineColor, label: 'This Month' },
          { name: 'previousMonth', color: 'gray', label: '6-Month Average' },
        ]}
      />
    </div>
  )
}
