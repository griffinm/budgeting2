import { useState } from "react";
import { Group, SegmentedControl, Text } from "@mantine/core";
import { MonthlyLineChart } from "@/components/MonthlySpend/MonthlyLineChart";
import { MovingAverage, Transaction } from "@/utils/types";

interface MonthlyTrendsProps {
  expenseTransactions: Transaction[];
  incomeTransactions: Transaction[];
  spendMovingAverage: MovingAverage[];
  incomeMovingAverage: MovingAverage[];
}

export function MonthlyTrends({
  expenseTransactions,
  incomeTransactions,
  spendMovingAverage,
  incomeMovingAverage,
}: MonthlyTrendsProps) {
  const [view, setView] = useState<string>("expense");

  return (
    <div className="flex flex-col gap-2">
      <Group justify="space-between" align="flex-end" mb="md">
        <Text size="lg" fw={600}>
          Monthly Trends
        </Text>
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
