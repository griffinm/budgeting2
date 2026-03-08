import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMerchant, fetchMerchantSpendStats } from "@/api";
import { fetchMerchantGroupSpendStats } from "@/api/merchant-groups-client";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { useTransactions } from "@/hooks";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading } from "@/components/Loading";
import { Badge, Breadcrumbs, Paper } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { TrendChart } from "./TrendChart";
import { SpendSummary } from "./SpendSummary";
import { MerchantGroupCard } from "./MerchantGroup";
import { HeroSection } from "./HeroSection";
import { CollapsibleCard } from "@/components/CollapsibleCard/CollapsibleCard";
import { useMerchantCategories } from "@/hooks/useMerchantCategories";
import { useTags } from "@/hooks/useTags";

export default function MerchantPage() {
  const { id } = useParams();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [merchantSpendStats, setMerchantSpendStats] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStatsLoading, setMerchantSpendStatsLoading] = useState(true);

  const {
    transactions,
    setSearchParams,
    isLoading: merchantTransactionsLoading,
    page: merchantTransactionsPage,
    updateTransaction: updateMerchantTransaction,
    error: merchantTransactionsError,
  } = useTransactions({
    initialSearchParams: {
      merchant_id: Number(id),
    },
  });
  const { rawMerchantCategories: allCategories } = useMerchantCategories();
  const { tags: allTags, createTag } = useTags();
  const [chartMonthsBack, setChartMonthsBack] = useState(6);

  // Slice the full 24-month data for the chart view
  const chartSpendStats = useMemo(() => {
    if (!merchantSpendStats) return undefined;
    return {
      ...merchantSpendStats,
      monthlySpend: merchantSpendStats.monthlySpend.slice(-chartMonthsBack),
    };
  }, [merchantSpendStats, chartMonthsBack]);

  const averageSpendForChart = useMemo(() => {
    if (!chartSpendStats) return undefined;
    const months = chartSpendStats.monthlySpend;
    if (months.length === 0) return undefined;
    return months.reduce((acc, curr) => acc + curr.amount, 0) / months.length;
  }, [chartSpendStats]);

  // Fetch the merchant
  useEffect(() => {
    setMerchantLoading(true);
    fetchMerchant({ id: Number(id) })
      .then(setMerchant)
      .finally(() => setMerchantLoading(false));
  }, [id]);

  // Get the transactions for the merchant or group
  useEffect(() => {
    if (merchant) {
      if (merchant.merchantGroup) {
        setSearchParams({ merchant_group_id: merchant.merchantGroup.id });
      } else {
        setSearchParams({ merchant_id: Number(id) });
      }
    }
  }, [id, setSearchParams, merchant]);

  // Single API call for spend stats (24 months covers all needs)
  useEffect(() => {
    if (merchant) {
      setMerchantSpendStatsLoading(true);

      const fetchStats = merchant.merchantGroup
        ? fetchMerchantGroupSpendStats({ id: merchant.merchantGroup.id, monthsBack: 24 })
        : fetchMerchantSpendStats({ id: Number(id), monthsBack: 24 });

      fetchStats
        .then((data) => {
          setMerchantSpendStats({
            monthsBack: data.monthsBack,
            monthlySpend: data.monthlySpend.map((month) => ({
              month: month.month,
              amount: Math.abs(month.amount || 0),
            })),
            allTimeSpend: data.allTimeSpend,
          });
        })
        .finally(() => setMerchantSpendStatsLoading(false));
    }
  }, [merchant, id]);

  if (merchantLoading || !merchant) {
    return <Loading />
  }

  const transactionCount = merchantTransactionsPage?.totalCount;

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.merchants.path()}>Merchants</Link>
        <span>{merchantDisplayName(merchant)}</span>
      </Breadcrumbs>
      <div className="flex flex-col gap-4">
        <HeroSection
          merchant={merchant}
          setMerchant={setMerchant}
          allCategories={allCategories}
          allTags={allTags}
          onCreateTag={createTag}
        />

        <SpendSummary spendStats={merchantSpendStats} loading={merchantSpendStatsLoading} />

        <Paper withBorder p="md" radius="md">
          <TrendChart
            merchantSpendStats={chartSpendStats}
            loading={merchantSpendStatsLoading}
            monthsBack={chartMonthsBack}
            onChangeMonthsBack={setChartMonthsBack}
            averageSpendForChart={averageSpendForChart}
          />
        </Paper>

        <CollapsibleCard
          title={merchant.merchantGroup ? 'Group Transactions' : 'Transactions'}
          initialState="collapsed"
          rightSection={transactionCount !== undefined ? <Badge variant="light">{transactionCount}</Badge> : undefined}
        >
          <TransactionsTable
            transactions={transactions}
            isLoading={merchantTransactionsLoading}
            page={merchantTransactionsPage}
            updateTransaction={updateMerchantTransaction}
            merchantCategories={[]}
            error={merchantTransactionsError}
            condensed={true}
            isLoadingMore={false}
            hasMore={false}
            loadMore={() => {}}
          />
        </CollapsibleCard>

        {merchant.merchantGroup && (
          <CollapsibleCard title="Merchant Group" initialState="collapsed">
            <MerchantGroupCard
              merchant={merchant}
              setMerchant={setMerchant}
            />
          </CollapsibleCard>
        )}
      </div>
    </div>
  )
}
