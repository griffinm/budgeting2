import { Transaction, TransactionType } from "@/utils/types";
import { LineChart } from "@mantine/charts";
import { transactionArrayToDailySeries } from "@/utils/chartUtils";
import '@mantine/charts/styles.css';

export interface MonthlyLineChartProps {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
}
export function MonthlyLineChart({
  currentMonthTransactions,
  previousMonthTransactions,
  transactionType,
  title,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
  title: string;
}) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isNegativeGood = transactionType === 'expense';
  const cardColor = isNegativeGood ? 'red.6' : 'green';
  const lineColor = transactionType === 'expense' ? 'red' : 'green';

  const dailyTotals = transactionArrayToDailySeries({
    currentMonthTransactions,
    previousMonthTransactions,
    currentMonth,
    currentYear,
    transactionType,
  });


  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4 flex flex-col gap-4">
      <h2 className="text-2xl">
        {title}
      </h2>

      <LineChart
        withLegend
        h={350}
        data={dailyTotals}
        dataKey="day"
        curveType="step"
        withDots={false}
        yAxisLabel={transactionType === 'expense' ? 'Expenses' : 'Income'}
        xAxisLabel="Day of Month"
        tooltipAnimationDuration={200}
        valueFormatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        series={[
          { name: 'currentMonth', color: lineColor, label: 'This Month' },
          { name: 'previousMonth', color: 'gray.6', label: 'Last Month' },
        ]}
      />
    </div>
  )
}
