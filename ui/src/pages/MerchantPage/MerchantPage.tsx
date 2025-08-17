import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMerchant, fetchMerchantSpendStats } from "@/api";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { useMerchants, useTransactions } from "@/hooks";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading } from "@/components/Loading";
import { Blockquote, Breadcrumbs, Card } from "@mantine/core";
import { currentMonthSpend, lastMonthSpend } from "./utils";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { TrendChart } from "./TrendChart";
import { EditableLabel } from "@/components/EditableLabel";
import { updateMerchant } from "@/api/merchant-client";

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
    setPage: setMerchantTransactionsPage,
    setPerPage: setMerchantTransactionsPerPage,
    searchParams: merchantTransactionsSearchParams,
    updateTransaction: updateMerchantTransaction,
    error: merchantTransactionsError,
    clearSearchParams,
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

  // Get the transactions for the merchant
  useEffect(() => {
    setSearchParams({ merchant_id: Number(id) });
  }, [id, setSearchParams]);

  // Get the spend stats for the merchant
  useEffect(() => {
    if (merchant) {
      setMerchantSpendStatsLoading(true);
      fetchMerchantSpendStats({ id: Number(id), monthsBack: chartMonthsBack })
        .then((data) => {
          setMerchantSpendStats({
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

        <Card>
          <h2 className="text-xl font-bold mb-4">Spend Summary</h2>
          <div className="flex flex-col md:flex-row gap-4 md:gap-20">
            <SpendSummaryCard
              title="Current Month"
              value={currentMonthSpend(merchantSpendStats || { monthlySpend: [], allTimeSpend: 0 })}
              loading={merchantSpendStatsLoading}
            />

            <SpendSummaryCard
              title="Last Month"
              value={lastMonthSpend(merchantSpendStats || { monthlySpend: [], allTimeSpend: 0 })}
              loading={merchantSpendStatsLoading}
            />

            <SpendSummaryCard
              title={`Last ${chartMonthsBack} Months`}
              value={merchantSpendStats?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) || 0}
              loading={merchantSpendStatsLoading}
            />

            <SpendSummaryCard
              title="All Time"
              value={merchantSpendStats?.allTimeSpend.toLocaleString() || 0}
              loading={merchantSpendStatsLoading}
            />
          </div>
        </Card>

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
          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          <TransactionsTable
            transactions={transactions}
            isLoading={merchantTransactionsLoading}
            page={merchantTransactionsPage}
            setPage={setMerchantTransactionsPage}
            setPerPage={setMerchantTransactionsPerPage}
            searchParams={merchantTransactionsSearchParams}
            onSetSearchParams={setSearchParams}
            updateTransaction={updateMerchantTransaction}
            merchantTags={[]}
            error={merchantTransactionsError}
            condensed={true}
            showSearch={false}
            clearSearchParams={clearSearchParams}
          />
        </Card>

      </div>
    </div>
  )
}

function SpendSummaryCard({
  title,
  value,
  loading
}: {
  title: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <Blockquote
      color="blue"
      className="w-1/2"
    >
      <h2 className="text-xl text-gray-500 font-bold mb-4">{title}</h2>
      {loading ? (
        <Loading fullHeight={false} />
      ) : (
        <p className="text-3xl">${value.toLocaleString()}</p>
      )}
    </Blockquote>
  )
}
