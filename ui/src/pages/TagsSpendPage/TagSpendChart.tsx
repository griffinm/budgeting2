import { BarChart } from "@mantine/charts";
import { Tag, TagSpendStats } from "@/utils/types";
import { formatSpendStatsForChart } from "./utils";

export function TagSpendChart({
  stats,
  allTags,
  monthsBack,
}: {
  stats: TagSpendStats[];
  allTags: Tag[];
  monthsBack: number;
}) {
  const { chartData, uniqueTags } = formatSpendStatsForChart({ stats, allTags, monthsBack });

  const transformedData = chartData.map(monthData => {
    const dataPoint: { month: string; [key: string]: string | number } = {
      month: monthData.month,
    };

    monthData.tags.forEach(tag => {
      const matchingUniqueTag = uniqueTags.find(ut => ut.id === tag.tagId);
      if (matchingUniqueTag) {
        dataPoint[matchingUniqueTag.name] = tag.totalAmount;
      }
    });

    return dataPoint;
  });

  const series = uniqueTags.map(tag => ({
    name: tag.name,
    color: tag.color,
  }));

  return (
    <BarChart
      h={400}
      data={transformedData}
      dataKey="month"
      series={series}
      type="stacked"
      withLegend={true}
      withYAxis={false}
      valueFormatter={(value: number) =>
        `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      }
    />
  );
}
