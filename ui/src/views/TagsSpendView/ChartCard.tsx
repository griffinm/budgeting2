import { Card, Text } from "@mantine/core";
import { IconBookmarks } from "@tabler/icons-react";
import { Tag, TagSpendStats } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { TagSpendChart } from "./TagSpendChart";

export function ChartCard({
  loadingTags,
  loadingStats,
  hasSelection,
  stats,
  allTags,
  monthsBack,
}: {
  loadingTags: boolean;
  loadingStats: boolean;
  hasSelection: boolean;
  stats: TagSpendStats[];
  allTags: Tag[];
  monthsBack: number;
}) {
  return (
    <Card shadow="sm" radius="md" withBorder p="lg">
      {loadingTags || loadingStats ? (
        <Loading />
      ) : !hasSelection ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <IconBookmarks size={48} stroke={1.2} />
          <Text size="lg" mt="md">Select tags to see spending trends</Text>
        </div>
      ) : (
        <TagSpendChart stats={stats} allTags={allTags} monthsBack={monthsBack} />
      )}
    </Card>
  );
}
