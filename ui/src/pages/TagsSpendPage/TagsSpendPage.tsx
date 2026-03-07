import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Text } from "@mantine/core";
import { IconBookmarks } from "@tabler/icons-react";
import { fetchTagSpendStats, fetchMerchantCategories, fetchTagReports, createTagReport, deleteTagReport } from "@/api";
import { MerchantCategory, TagSpendStats, TagReport } from "@/utils/types";
import { useTags } from "@/hooks/useTags";
import { useTransactions } from "@/hooks";
import { Loading } from "@/components/Loading";
import { MonthsBackSelect } from "@/components/MonthsBackSelect/MonthsBackSelect";
import { TransactionsTable } from "@/components/TransactionsTable";
import { TagSelector } from "./TagSelector";
import { TagSpendChart } from "./TagSpendChart";
import { SavedTagReports } from "./SavedTagReports";
import { format } from "date-fns";

function getDateRange(monthsBack: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  return {
    start_date: format(start, "yyyy-MM-dd"),
    end_date: format(now, "yyyy-MM-dd"),
  };
}

export default function TagsSpendPage() {
  const { tags, loading: loadingTags, createTag } = useTags();
  const [includedTagIds, setIncludedTagIds] = useState<number[]>([]);
  const [omittedTagIds, setOmittedTagIds] = useState<number[]>([]);
  const [monthsBack, setMonthsBack] = useState(6);
  const [stats, setStats] = useState<TagSpendStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [tagReports, setTagReports] = useState<TagReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  const dateRange = useMemo(() => getDateRange(monthsBack), [monthsBack]);

  const {
    transactions,
    isLoading: isLoadingTransactions,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    page,
    updateTransaction,
    addTransactionTag,
    removeTransactionTag,
    setSearchParams,
  } = useTransactions({
    initialSearchParams: {
      tag_ids: includedTagIds,
      omit_tag_ids: omittedTagIds,
      ...dateRange,
    },
  });

  useEffect(() => {
    setSearchParams({
      tag_ids: includedTagIds,
      omit_tag_ids: omittedTagIds,
      ...dateRange,
    });
  }, [includedTagIds, omittedTagIds, dateRange]);

  useEffect(() => {
    fetchMerchantCategories().then(setMerchantCategories).catch(console.error);
    loadTagReports();
  }, []);

  const loadTagReports = useCallback(() => {
    fetchTagReports().then(setTagReports).catch(console.error);
  }, []);

  const handleSelectReport = useCallback((report: TagReport) => {
    setActiveReportId(report.id);
    setIncludedTagIds(report.includedTagIds);
    setOmittedTagIds(report.omittedTagIds);
  }, []);

  const handleSaveReport = useCallback(async (name: string) => {
    await createTagReport({ name, includedTagIds, omittedTagIds });
    loadTagReports();
  }, [includedTagIds, omittedTagIds, loadTagReports]);

  const handleDeleteReport = useCallback(async (id: number) => {
    await deleteTagReport(id);
    if (activeReportId === id) setActiveReportId(null);
    loadTagReports();
  }, [activeReportId, loadTagReports]);

  useEffect(() => {
    if (includedTagIds.length === 0) {
      setStats([]);
      return;
    }
    setLoadingStats(true);
    fetchTagSpendStats({ tagIds: includedTagIds, monthsBack, omitTagIds: omittedTagIds })
      .then(setStats)
      .finally(() => setLoadingStats(false));
  }, [includedTagIds, omittedTagIds, monthsBack]);

  const createAndAddTag = async (transactionId: number, name: string) => {
    const newTag = await createTag(name);
    addTransactionTag(transactionId, newTag.id);
  };

  const hasSelection = includedTagIds.length > 0 || omittedTagIds.length > 0;

  return (
    <div className="h-full flex flex-col gap-6">
      <Card shadow="sm" radius="md" withBorder p="lg">
        <div className="flex flex-col gap-4">
          <SavedTagReports
            reports={tagReports}
            activeReportId={activeReportId}
            onSelect={handleSelectReport}
            onSave={handleSaveReport}
            onDelete={handleDeleteReport}
            canSave={includedTagIds.length > 0 || omittedTagIds.length > 0}
          />
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <TagSelector
              tags={tags}
              includedTagIds={includedTagIds}
              omittedTagIds={omittedTagIds}
              onIncludeChange={(ids) => { setActiveReportId(null); setIncludedTagIds(ids); }}
              onOmitChange={(ids) => { setActiveReportId(null); setOmittedTagIds(ids); }}
            />
          </div>
          <MonthsBackSelect value={monthsBack} onChange={setMonthsBack} />
        </div>
        </div>
      </Card>

      <Card shadow="sm" radius="md" withBorder p="lg">
        {loadingTags || loadingStats ? (
          <Loading />
        ) : !hasSelection ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IconBookmarks size={48} stroke={1.2} />
            <Text size="lg" mt="md">Select tags to see spending trends</Text>
          </div>
        ) : (
          <TagSpendChart stats={stats} allTags={tags} monthsBack={monthsBack} />
        )}
      </Card>

      {hasSelection && (
        <Card p={0} shadow="sm" radius="md" withBorder className="flex-1 min-h-0">
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoadingTransactions}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            error={error}
            page={page}
            updateTransaction={updateTransaction}
            merchantCategories={merchantCategories}
            allTags={tags}
            addTransactionTag={addTransactionTag}
            removeTransactionTag={removeTransactionTag}
            createAndAddTag={createAndAddTag}
          />
        </Card>
      )}
    </div>
  );
}
