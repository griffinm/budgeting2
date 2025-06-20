import { Loading } from "@/components/Loading";
import { MerchantSpendStats } from "@/utils/types";
import { BarChart } from "@mantine/charts";
import '@mantine/charts/styles.css';
import { Select } from "@mantine/core";

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
      <div className="flex-0 flex flex-row gap-6 justify-end mb-6">
        <Select
          value={monthsBack.toString()}
          onChange={(value) => onChangeMonthsBack(parseInt(value || '6'))}
          data={['1', '3', '6', '12', '24']}
          label="Months Back"
        />
      </div>
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
            label: `Average: $${averageSpendForChart.toLocaleString()}`,
            color: 'red',
            strokeWidth: 2,
            strokeDasharray: '3 3',
          }] : []}
          valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
        />
      </div>
    </div>
  )
}