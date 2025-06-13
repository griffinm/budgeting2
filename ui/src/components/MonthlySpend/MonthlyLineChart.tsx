import { Transaction, TransactionType } from "@/utils/types";
import { LineChart } from "@mantine/charts";
import { transactionArrayToDailySeries } from "@/utils/chartUtils";

export interface MonthlyLineChartProps {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
}
export function MonthlyLineChart({
  currentMonthTransactions,
  previousMonthTransactions,
  transactionType,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
}) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const dailyTotals = transactionArrayToDailySeries({
    currentMonthTransactions,
    previousMonthTransactions,
    currentMonth,
    currentYear,
    transactionType,
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      <h2 className="text-lg font-bold mb-4">
        {transactionType === 'expense' ? 'Expenses' : 'Income'} Versus Last Month
      </h2>
      <LineChart
        h={300}
        data={dailyTotals}
        dataKey="day"
        series={[
          { name: 'currentMonth', color: 'indigo.6' },
          { name: 'previousMonth', color: 'blue.6' },
        ]}
        curveType="linear"
      />
    </div>
  )
}