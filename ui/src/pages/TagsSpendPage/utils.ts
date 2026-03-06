import { Tag, TagSpendStats } from "@/utils/types";

export function formatSpendStatsForChart({
  stats,
  allTags,
  monthsBack,
}: {
  stats: TagSpendStats[];
  allTags: Tag[];
  monthsBack: number;
}) {
  const uniqueTagIds = [...new Set(stats.map(stat => stat.tagId))].filter(tagId =>
    allTags.some(tag => tag.id === tagId)
  );

  const currentDate = new Date();
  const months = [];

  for (let i = monthsBack; i >= 1; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

    months.push({
      monthKey,
      monthLabel: monthKey,
      monthNum: month,
      year
    });
  }

  const groupedByMonth = stats.reduce((acc, stat) => {
    const monthKey = `${stat.year}-${stat.month.toString().padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        monthNum: stat.month,
        year: stat.year,
        tags: [] as Array<{ tagId: number; totalAmount: number; tagName: string }>
      };
    }

    const tag = allTags.find((t) => t.id === stat.tagId);
    const tagName = tag?.name || `Tag ${stat.tagId}`;

    acc[monthKey].tags.push({
      tagId: stat.tagId,
      totalAmount: stat.totalAmount,
      tagName
    });

    return acc;
  }, {} as Record<string, {
    month: string;
    monthNum: number;
    year: number;
    tags: Array<{ tagId: number; totalAmount: number; tagName: string }>
  }>);

  const completeChartData = months.map(monthInfo => {
    const monthData = groupedByMonth[monthInfo.monthKey];

    const existingTags = new Map(monthData?.tags.map(tag => [tag.tagId, tag.totalAmount]) || []);

    const completeTags = uniqueTagIds.map(tagId => {
      const tag = allTags.find((t) => t.id === tagId);
      const tagName = tag?.name || `Tag ${tagId}`;
      const totalAmount = existingTags.get(tagId) || 0;

      return { tagId, totalAmount, tagName };
    });

    return {
      month: monthInfo.monthLabel,
      monthNum: monthInfo.monthNum,
      year: monthInfo.year,
      tags: completeTags
    };
  });

  return {
    chartData: completeChartData,
    uniqueTagIds,
    uniqueTags: uniqueTagIds.map(tagId => {
      const tag = allTags.find((t) => t.id === tagId);
      const color = tag?.color ? `#${tag.color}` : '#000000';

      return {
        id: tagId,
        name: tag?.name || `Tag ${tagId}`,
        color: color
      };
    })
  };
}
