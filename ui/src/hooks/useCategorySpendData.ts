import { useCallback, useEffect, useMemo, useState } from "react";
import { startOfMonth, subMonths } from "date-fns";
import {
  createMerchantCategory,
  CreateMerchantCategoryRequest,
  deleteMerchantCategory,
  fetchMerchantCategoryMonthlySpendStats,
  fetchMerchantCategorySpendSummary,
  updateMerchantCategory,
  UpdateMerchantCategoryRequest,
} from "@/api";
import { MerchantCategory, MerchantCategorySpendStats } from "@/utils/types";
import { formatMerchantCategoriesAsTree } from "@/utils/merchantCategoryUtils";

export const SPARKLINE_MONTHS = 6;

export function useCategorySpendData({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  const [flat, setFlat] = useState<MerchantCategory[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MerchantCategorySpendStats[]>([]);
  const [uncategorizedTotal, setUncategorizedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const now = new Date();
    const [summary, monthly] = await Promise.all([
      fetchMerchantCategorySpendSummary({ startDate, endDate }),
      // Sparklines always show the trailing months, independent of the selected range
      fetchMerchantCategoryMonthlySpendStats({
        startDate: startOfMonth(subMonths(now, SPARKLINE_MONTHS - 1)),
        endDate: now,
      }),
    ]);
    setFlat(summary.tags);
    setUncategorizedTotal(summary.uncategorizedTotal);
    setMonthlyStats(monthly);
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const tree = useMemo(
    () => formatMerchantCategoriesAsTree({ merchantCategories: flat }),
    [flat],
  );

  const monthlyByTagId = useMemo(() => {
    const map = new Map<number, MerchantCategorySpendStats[]>();
    monthlyStats.forEach((stat) => {
      const list = map.get(stat.tagId) || [];
      list.push(stat);
      map.set(stat.tagId, list);
    });
    return map;
  }, [monthlyStats]);

  // Every mutation refetches: leafness, budgets, and spend rollups all change
  // server-side, so patching local state would drift.
  const mutate = useCallback(
    async (action: () => Promise<unknown>) => {
      setSaving(true);
      try {
        await action();
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const create = useCallback(
    (params: CreateMerchantCategoryRequest) =>
      mutate(() => createMerchantCategory({ data: params })),
    [mutate],
  );

  const update = useCallback(
    (params: UpdateMerchantCategoryRequest) =>
      mutate(() => updateMerchantCategory({ data: params })),
    [mutate],
  );

  const remove = useCallback(
    (id: number) => mutate(() => deleteMerchantCategory({ id })),
    [mutate],
  );

  return {
    tree,
    flat,
    monthlyByTagId,
    uncategorizedTotal,
    loading,
    saving,
    refresh,
    create,
    update,
    remove,
  };
}
