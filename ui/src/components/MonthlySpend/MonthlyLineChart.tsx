import { Transaction, TransactionType } from "@/utils/types";
import { LineChart } from "@mantine/charts";
import { transactionArrayToDailySeries } from "@/utils/chartUtils";
import '@mantine/charts/styles.css';
import { Select } from "@mantine/core";
import { useState } from "react";

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
  average,
  monthsBack: initialMonthsBack,
  onChangeMonthsBack,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
  title: string;
  average: number;
  monthsBack: number;
  onChangeMonthsBack: (monthsBack: number) => void;
}) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lineColor = transactionType === 'expense' ? 'red' : 'green';
  const [monthsBack, setMonthsBack] = useState(initialMonthsBack);

  const handleMonthsBackChange = (value: string | null) => {
    if (value) {
      setMonthsBack(parseInt(value));
      onChangeMonthsBack(parseInt(value));
    }
  };

  const dailyTotals = transactionArrayToDailySeries({
    currentMonthTransactions,
    previousMonthTransactions,
    currentMonth,
    currentYear,
    transactionType,
  });


  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4 flex flex-col gap-4">
      <div className="flex flex-row gap-2 justify-between mb-2">
        <h2 className="text-2xl">
          {title}
        </h2>
        <div className="flex flex-row gap-2">
          <Select
            size="sm"
            data={[
              { value:  '1', label: '1 Month Back' },
              { value:  '3', label: '3 Months Back' },
              { value:  '6', label: '6 Months Back' },
            ]}
            value={monthsBack.toString()}
            label="Show average as"
            onChange={(value) => handleMonthsBackChange(value)}
          />
        </div>
      </div>


      <LineChart
        withLegend
        h={350}
        data={dailyTotals}
        strokeWidth={3}
        dataKey="day"
        curveType="step"
        withDots={false}
        yAxisLabel={transactionType === 'expense' ? 'Expenses' : 'Income'}
        xAxisLabel="Day of Month"
        tooltipAnimationDuration={200}
        referenceLines={[
          { 
            y: average, 
            label: `${monthsBack} Month Average: $${average.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 
            color: 'blue', 
            strokeWidth: 2,
            strokeDasharray: '3 3',
          },
        ]}
        valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        series={[
          { name: 'currentMonth', color: lineColor, label: 'This Month' },
          { name: 'previousMonth', color: 'gray', label: 'Last Month' },
        ]}
      />
    </div>
  )
}
