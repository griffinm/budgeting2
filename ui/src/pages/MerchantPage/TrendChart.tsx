import { Loading } from "@/components/Loading";
import { MerchantSpendStats } from "@/utils/types";
import { BarChart } from "@mantine/charts";
import { Group, Select, Text } from "@mantine/core";

export function TrendChart({
  merchantSpendStats,
  loading,
  monthsBack=6,
  onChangeMonthsBack,
  averageSpendForChart,
}: {
  merchantSpendStats?: MerchantSpendStats;
  loading: boolean;
  monthsBack: number;
  onChangeMonthsBack: (monthsBack: number) => void;
  averageSpendForChart?: number;
}) {

  if (loading || !merchantSpendStats) {
    return <Loading fullHeight={false} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Group justify="space-between" align="flex-end" mb="md">
        <Text size="lg" fw={600}>Spending Trend</Text>
        <Select
          value={monthsBack.toString()}
          onChange={(value) => onChangeMonthsBack(parseInt(value || '6'))}
          data={['1', '3', '6', '12', '24']}
          label="Months Back"
          size="xs"
          w={100}
        />
      </Group>
      <div className="flex-1">
        <BarChart
          title="Trend Chart"
          h={350}
          data={merchantSpendStats.monthlySpend.map((month) => ({
            month: month.month,
            amount: Math.abs(month.amount || 0),
          }))}
          dataKey="month"
          series={[
            { name: 'amount', color: 'blue', label: 'Amount' },
          ]}
          withLegend={false}
          referenceLines={averageSpendForChart ? [{
            y: averageSpendForChart,
            label: `Average: $${averageSpendForChart.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            color: 'red',
            strokeWidth: 2,
            strokeDasharray: '3 3',
          }] : []}
          valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        />
      </div>
    </div>
  )
}
