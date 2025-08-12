import { MerchantTag, MerchantTagSpendStats } from "@/utils/types";

export function formatSpendStatsForChart({
  stats,
  allMerchantTags,
  monthsBack,
}: {
  stats: MerchantTagSpendStats[];
  allMerchantTags: MerchantTag[];
  monthsBack: number;
}) {
  // Get unique tag IDs that are actually present in stats AND exist in allMerchantTags
  const uniqueTagIds = [...new Set(stats.map(stat => stat.tagId))].filter(tagId => 
    allMerchantTags.some(tag => tag.id === tagId)
  );
  
  // Generate the complete range of months going back from current month
  const currentDate = new Date();
  const months = [];
  
  for (let i = monthsBack; i >= 1; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const monthLabel = `${year}-${month.toString().padStart(2, '0')}`;
    
    months.push({
      monthKey,
      monthLabel,
      monthNum: month,
      year
    });
  }
  
  // Group stats by month/year
  const groupedByMonth = stats.reduce((acc, stat) => {
    const monthKey = `${stat.year}-${stat.month.toString().padStart(2, '0')}`;
    const monthLabel = `${stat.year}-${stat.month.toString().padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        monthNum: stat.month,
        year: stat.year,
        tags: [] as Array<{ tagId: number; totalAmount: number; tagName: string }>
      };
    }
    
    // Find the merchant tag name
    const merchantTag = allMerchantTags.find((tag) => tag.id === stat.tagId);
    const tagName = merchantTag?.name || `Tag ${stat.tagId}`;
    
    // Add the tag data to the month group
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

  // Ensure every tag has an entry for every month in the range (with 0 amount if no data)
  const completeChartData = months.map(monthInfo => {
    const monthData = groupedByMonth[monthInfo.monthKey];
    const monthLabel = monthInfo.monthLabel;
    const monthNum = monthInfo.monthNum;
    const year = monthInfo.year;
    
    // Create a map of existing tag data for this month
    const existingTags = new Map(monthData?.tags.map(tag => [tag.tagId, tag.totalAmount]) || []);
    
    // Ensure every unique tag has an entry for this month
    const completeTags = uniqueTagIds.map(tagId => {
      const merchantTag = allMerchantTags.find((tag) => tag.id === tagId);
      const tagName = merchantTag?.name || `Tag ${tagId}`;
      const totalAmount = existingTags.get(tagId) || 0;
      
      return {
        tagId,
        totalAmount,
        tagName
      };
    });
    
    return {
      month: monthLabel,
      monthNum,
      year,
      tags: completeTags
    };
  });

  return {
    chartData: completeChartData,
    uniqueTagIds,
    uniqueTags: uniqueTagIds.map(tagId => {
      const merchantTag = allMerchantTags.find((tag) => tag.id === tagId);
      const color = merchantTag?.color ? `#${merchantTag.color}` : '#000000';
      
      return {
        id: tagId,
        name: merchantTag?.name || `Tag ${tagId}`,
        color: color
      };
    })
  };
}
