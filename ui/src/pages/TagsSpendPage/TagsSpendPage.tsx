import { useEffect, useState } from "react";
import { Card, Text } from "@mantine/core";
import { IconBookmarks } from "@tabler/icons-react";
import { fetchTagSpendStats } from "@/api";
import { TagSpendStats } from "@/utils/types";
import { useTags } from "@/hooks/useTags";
import { Loading } from "@/components/Loading";
import { MonthsBackSelect } from "@/components/MonthsBackSelect/MonthsBackSelect";
import { TagSelector } from "./TagSelector";
import { TagSpendChart } from "./TagSpendChart";

export default function TagsSpendPage() {
  const { tags, loading: loadingTags } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [monthsBack, setMonthsBack] = useState(6);
  const [stats, setStats] = useState<TagSpendStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (selectedTagIds.length === 0) {
      setStats([]);
      return;
    }
    setLoadingStats(true);
    fetchTagSpendStats({ tagIds: selectedTagIds, monthsBack })
      .then(setStats)
      .finally(() => setLoadingStats(false));
  }, [selectedTagIds, monthsBack]);

  return (
    <div className="h-full flex flex-col gap-6">
      <Card shadow="sm" radius="md" withBorder p="lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <TagSelector
              tags={tags}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>
          <MonthsBackSelect value={monthsBack} onChange={setMonthsBack} />
        </div>
      </Card>

      <Card shadow="sm" radius="md" withBorder p="lg" className="flex-1">
        {loadingTags || loadingStats ? (
          <Loading />
        ) : selectedTagIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IconBookmarks size={48} stroke={1.2} />
            <Text size="lg" mt="md">Select tags to see spending trends</Text>
          </div>
        ) : (
          <TagSpendChart stats={stats} allTags={tags} monthsBack={monthsBack} />
        )}
      </Card>
    </div>
  );
}
