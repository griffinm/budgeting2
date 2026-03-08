import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchTagSpendStats, fetchMerchantCategories, fetchTagReports, createTagReport, deleteTagReport } from "@/api";
import { MerchantCategory, TagSpendStats, TagReport } from "@/utils/types";
import { useTags } from "@/hooks/useTags";
import { useTransactions } from "@/hooks";
import { usePageTitle } from "@/hooks/usePageTitle";
import { TagsSpendView } from "@/views/TagsSpendView";
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
  const setPageTitle = usePageTitle();
  useEffect(() => { setPageTitle("Tag Spend"); }, [setPageTitle]);

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

  return (
    <TagsSpendView
      tags={tags}
      loadingTags={loadingTags}
      includedTagIds={includedTagIds}
      setIncludedTagIds={setIncludedTagIds}
      omittedTagIds={omittedTagIds}
      setOmittedTagIds={setOmittedTagIds}
      monthsBack={monthsBack}
      setMonthsBack={setMonthsBack}
      stats={stats}
      loadingStats={loadingStats}
      merchantCategories={merchantCategories}
      tagReports={tagReports}
      activeReportId={activeReportId}
      setActiveReportId={setActiveReportId}
      handleSelectReport={handleSelectReport}
      handleSaveReport={handleSaveReport}
      handleDeleteReport={handleDeleteReport}
      transactions={transactions}
      isLoadingTransactions={isLoadingTransactions}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      error={error}
      page={page}
      updateTransaction={updateTransaction}
      addTransactionTag={addTransactionTag}
      removeTransactionTag={removeTransactionTag}
      createAndAddTag={createAndAddTag}
    />
  );
}
