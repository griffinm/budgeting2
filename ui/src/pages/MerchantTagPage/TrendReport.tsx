import { CollapsibleCard } from "@/components/CollapsibleCard";
import { fetchMerchantTagSpendStats } from "@/api";
import { useEffect, useState } from "react";
import { MerchantTag, MerchantTagSpendStats } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { useMerchantTags } from "@/hooks/useMerchantTags";
import { BarChart } from "@mantine/charts";
import { formatSpendStatsForChart } from "./utils";
import { MonthsBackSelect } from "@/components/MonthsBackSelect/MonthsBackSelect";

export function TrendReport({
  tagId,
}: {
  tagId: number;
}) {
  const [stats, setStats] = useState<MerchantTagSpendStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [monthsBack, setMonthsBack] = useState(6);
  const {
    rawMerchantTags: merchantTags,
    loading: loadingMerchantTags,
  } = useMerchantTags();
  const loading = loadingStats || loadingMerchantTags;

  useEffect(() => {
    fetchMerchantTagSpendStats({ tagId, monthsBack })
      .then((resp) => {
        setStats(resp as MerchantTagSpendStats[]);
      })
      .finally(() => setLoadingStats(false));
  }, [tagId, monthsBack]);

  return (
    <CollapsibleCard title="Trend Report" initialState="expanded">
      {loading ? <Loading /> : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <MonthsBackSelect
              value={monthsBack}
              onChange={setMonthsBack}
            />
          </div>
          <TrendChart stats={stats} allMerchantTags={merchantTags} monthsBack={monthsBack} />
        </div>
      )}
    </CollapsibleCard>
  );
}

function TrendChart({
  stats,
  allMerchantTags,
  monthsBack,
}: {
  stats: MerchantTagSpendStats[];
  allMerchantTags: MerchantTag[];
  monthsBack: number;
}) {
  const { chartData, uniqueTags } = formatSpendStatsForChart({ stats, allMerchantTags, monthsBack });
  
  // Transform chartData to format expected by Mantine BarChart
  const transformedData = chartData.map(monthData => {
    const dataPoint: { month: string; [key: string]: string | number } = {
      month: monthData.month,
    };
    
    // Add each tag's amount as a property using the exact name from uniqueTags
    monthData.tags.forEach(tag => {
      const matchingUniqueTag = uniqueTags.find(ut => ut.id === tag.tagId);
      if (matchingUniqueTag) {
        dataPoint[matchingUniqueTag.name] = tag.totalAmount;
      }
    });
    
    return dataPoint;
  });
  
  // Create series configuration for the chart
  const series = uniqueTags.map(tag => ({
    name: tag.name,
    color: tag.color,
  }));

  return <BarChart
    title="Spend over time"
    h={350}
    data={transformedData}
    dataKey="month"
    series={series}
    type="stacked"
    withLegend={true}
    valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
  />;
}
