import { Loading } from "@/components/Loading";
import { MerchantSpendStats } from "@/utils/types";
import { BarChart } from "@mantine/charts";
import '@mantine/charts/styles.css';

export function TrendChart({
  merchantSpendStats,
  loading,
}: {
  merchantSpendStats?: MerchantSpendStats;
  loading: boolean;
}) {

  if (loading || !merchantSpendStats) {
    return <Loading fullHeight={false} />;
  }

  return (
    <div>
      <BarChart
        title="Trend Chart"
        h={350}
        data={merchantSpendStats.monthlySpend.map((month) => ({
          month: month.month,
          amount: month.amount,
        }))}
        dataKey="month"
        series={[
          { name: 'amount', color: 'blue', label: 'Amount' },
        ]}
        withLegend={false}
      />
    </div>
  )
}