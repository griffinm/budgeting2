import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMerchant, fetchMerchantSpendStats } from "@/api";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { useTransactions } from "@/hooks";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading } from "@/components/Loading";
import { Blockquote } from "@mantine/core";
import { currentMonthSpend, lastMonthSpend } from "./utils";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { BorderBox } from "@/components/BorderBox/BorderBox";

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
  } = useTransactions({
    initialSearchParams: {
      merchant_id: Number(id),
    },
  });

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
      fetchMerchantSpendStats({ id: Number(id) })
        .then(setMerchantSpendStats)
        .finally(() => setMerchantSpendStatsLoading(false));
    }
  }, [merchant]);

  if (merchantLoading || !merchant) {
    return <Loading />
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{merchantDisplayName(merchant)}</h1>

      <BorderBox>
        <h2 className="text-xl font-bold mb-4">Spend Summary</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-20">
          <Blockquote
            color="blue"
            className="w-1/2"
          >
            <h2 className="text-xl text-gray-500 font-bold mb-4">Current Month</h2>
            <p className="text-3xl">
              ${currentMonthSpend(merchantSpendStats || { monthlySpend: [], allTimeSpend: 0 })}
            </p>
          </Blockquote>

          <Blockquote
            color="blue"
            className="w-1/2"
          >
            <h2 className="text-xl text-gray-500 font-bold mb-4">Last Month</h2>
            <p className="text-3xl">
              ${lastMonthSpend(merchantSpendStats || { monthlySpend: [], allTimeSpend: 0 })}
            </p>
          </Blockquote>

          <Blockquote
            color="blue"
            className="w-1/2"
          >
            <h2 className="text-xl text-gray-500 font-bold mb-4">Last 6 Months</h2>
            <p className="text-3xl">
              ${merchantSpendStats?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
          </Blockquote>

          <Blockquote
            color="blue"
            className="w-1/2"
          >
            <h2 className="text-xl text-gray-500 font-bold mb-4">All Time</h2>
            <p className="text-3xl">
              ${merchantSpendStats?.allTimeSpend.toLocaleString()}
            </p>
          </Blockquote>
        </div>
      </BorderBox>

      <BorderBox>
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
          showCols={['date', 'amount', 'account']}
          showSearch={false}
        />
      </BorderBox>

    </div>
  )
}