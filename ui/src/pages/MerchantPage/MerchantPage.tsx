import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMerchant, fetchMerchantSpendStats } from "@/api";
import { fetchMerchantGroupSpendStats } from "@/api/merchant-groups-client";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { useTransactions } from "@/hooks";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading } from "@/components/Loading";
import { Breadcrumbs, Card } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { TrendChart } from "./TrendChart";
import { EditableLabel } from "@/components/EditableLabel";
import { updateMerchant } from "@/api/merchant-client";
import { SpendSummary } from "./SpendSummary";
import { MerchantGroupCard } from "./MerchantGroup";

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
  const [chartMonthsBack, setChartMonthsBack] = useState(6);
  const averageSpendForChart = useMemo(() => {
    if (!merchantSpendStats) {
      return undefined;
    }
    return merchantSpendStats.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) / chartMonthsBack;
  }, [merchantSpendStats, chartMonthsBack]);

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
      // If merchant belongs to a group, show group transactions; otherwise show merchant transactions
      if (merchant.merchantGroup) {
        setSearchParams({ merchant_group_id: merchant.merchantGroup.id });
      } else {
        setSearchParams({ merchant_id: Number(id) });
      }
    }
  }, [id, setSearchParams, merchant]);

  // Get the spend stats for the merchant or group
  useEffect(() => {
    if (merchant) {
      setMerchantSpendStatsLoading(true);
      
      // If merchant belongs to a group, fetch group stats; otherwise fetch merchant stats
      const fetchStats = merchant.merchantGroup 
        ? fetchMerchantGroupSpendStats({ id: merchant.merchantGroup.id, monthsBack: chartMonthsBack })
        : fetchMerchantSpendStats({ id: Number(id), monthsBack: chartMonthsBack });
      
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
  }, [merchant, chartMonthsBack, setMerchantSpendStatsLoading, id]);

  if (merchantLoading || !merchant) {
    return <Loading />
  }

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.merchants.path()}>Merchants</Link>
        <span>{merchantDisplayName(merchant)}</span>
      </Breadcrumbs>
      <div className="flex flex-col gap-4">
        <EditableLabel
          id={merchant.id}
          component="h1"
          additionalClasses="text-2xl font-bold"
          value={merchantDisplayName(merchant)}
          linkValue={urls.merchant.path(merchant.id)}
          onSave={async (id: number, value: string) => {
            updateMerchant({ id, value: { customName: value } }).then(() => {
              setMerchant(prev => prev ? { ...prev, customName: value } : null);
            });
          }}
        />

        <SpendSummary merchant={merchant} />

        <Card>
          <TrendChart
            merchantSpendStats={merchantSpendStats || undefined}
            loading={merchantSpendStatsLoading}
            monthsBack={chartMonthsBack}
            onChangeMonthsBack={setChartMonthsBack}
            averageSpendForChart={averageSpendForChart}
            />
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">
            {merchant.merchantGroup ? 'Group Transactions' : 'Transactions'}
          </h2>
          <TransactionsTable
            transactions={transactions}
            isLoading={merchantTransactionsLoading}
            page={merchantTransactionsPage}
            updateTransaction={updateMerchantTransaction}
            merchantTags={[]}
            error={merchantTransactionsError}
            condensed={true}
            isLoadingMore={false}
            hasMore={false}
            loadMore={() => {}}
          />
        </Card>
        
        {merchant.merchantGroup && (
          <MerchantGroupCard
            merchant={merchant}
            setMerchant={setMerchant}
          />
        )}

      </div>
    </div>
  )
}
