import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMerchant, fetchMerchantSpendStats } from "@/api";
import { fetchMerchantGroupSpendStats } from "@/api/merchant-groups-client";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { useTransactions } from "@/hooks";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading } from "@/components/Loading";
import { MerchantLinking } from "@/components/MerchantLinking";
import { Breadcrumbs, Card, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { ColorBox } from "@/components/ColorBox";
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
          <h2 className="text-xl font-bold mb-4">
            {merchant.merchantGroup ? 'Group Spend Summary' : 'Spend Summary'}
          </h2>
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
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Merchant Group</h2>
            <Tooltip
              label={
                <div className="max-w-md">
                  <p className="mb-2">
                    A Merchant Group is a way to combine multiple merchants into one for easier tracking. Sometimes merchant names
                    are different across transactions. In order for Budgeting to know these are the same merchants they need to be grouped together.
                  </p>
                  <p className="mb-2">
                    For instance <strong>"Amazon"</strong> and <strong>"Amazon.com, Inc."</strong> are the same merchant.
                    Similarly <strong>"Starbucks"</strong> and <strong>"Starbucks Corporation"</strong> are the same merchant.
                  </p>
                  <p className="mb-2">
                    This is why we have Merchant Groups. You can create a group for these merchants and then all the transactions for
                    these merchants will be grouped together.
                  </p>
                  <p>
                    You can also add merchants to an existing group.
                  </p>
                </div>
              }
              multiline
              withArrow
              position="bottom-start"
              w={400}
            >
              <IconInfoCircle size={20} className="text-gray-500 cursor-help" />
            </Tooltip>
          </div>
          
          {/* Merchant Linking Component */}
          <div className="mb-6">
            <MerchantLinking 
              merchant={merchant} 
              onMerchantUpdate={setMerchant}
            />
          </div>

          {/* Group Information and Merchants */}
          {merchant.merchantGroup && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {merchant.merchantGroup.name}
                </h3>
                {merchant.merchantGroup.description && (
                  <p className="text-gray-600 mb-4">{merchant.merchantGroup.description}</p>
                )}
                <div className="text-sm text-gray-500 mb-4">
                  {merchant.merchantGroup.merchants?.length || 0} merchants in this group
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Merchants in this group:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {merchant.merchantGroup.merchants?.map((groupMerchant) => (
                    <div
                      key={groupMerchant.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        groupMerchant.id === merchant.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link
                            to={urls.merchant.path(groupMerchant.id)}
                            className={`font-medium ${
                              groupMerchant.id === merchant.id
                                ? 'text-blue-700'
                                : 'text-gray-700 hover:text-blue-600'
                            }`}
                          >
                            {merchantDisplayName(groupMerchant)}
                          </Link>
                          {groupMerchant.id === merchant.merchantGroup?.primaryMerchant?.id && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              Primary Merchant
                            </div>
                          )}
                          {groupMerchant.id === merchant.id && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              Current Merchant
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
    <ColorBox>
      <div className="flex flex-col justify-between h-full items-center p-4">
        <div className="text-sm text-gray-500">
          {title}
        </div>
        {loading ? (
          <Loading fullHeight={false} />
        ) : (
          <div className="text-3xl font-bold mt-2">
            ${value.toLocaleString()}
          </div>
        )}
      </div>
    </ColorBox>
  )
}
