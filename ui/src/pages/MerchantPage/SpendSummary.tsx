import { ColorBox } from "@/components/ColorBox";
import { Loading } from "@/components/Loading";
import { Merchant, MerchantSpendStats } from "@/utils/types";
import { Card } from "@mantine/core";
import { useEffect, useState } from "react";
import { useMerchants } from "@/hooks/useMerchants";

export function SpendSummary({
  merchant,
}: {
  merchant: Merchant;
}) {
  const [merchantSpendStatsThisMonth, setMerchantSpendStatsThisMonth] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStatsThisMonthLoading, setMerchantSpendStatsThisMonthLoading] = useState(true);
  const [merchantSpendStats3Months, setmerchantSpendStats3Months] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStats3MonthsLoading, setmerchantSpendStats3MonthsLoading] = useState(true);
  const [merchantSpendStats6Months, setmerchantSpendStats6Months] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStats6MonthsLoading, setmerchantSpendStats6MonthsLoading] = useState(true);
  const [merchantSpendStats12Months, setmerchantSpendStats12Months] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStats12MonthsLoading, setmerchantSpendStats12MonthsLoading] = useState(true);
  const [merchantSpendStatsAllTime, setmerchantSpendStatsAllTime] = useState<MerchantSpendStats | null>(null);
  const [merchantSpendStatsAllTimeLoading, setmerchantSpendStatsAllTimeLoading] = useState(true);

  const { fetchMerchantSpendStats } = useMerchants({ initialSearchParams: {  } });

  useEffect(() => {
    fetchMerchantSpendStats({ id: merchant.id, monthsBack: 1 }).then((data) => {
      setMerchantSpendStatsThisMonth(data);
      setMerchantSpendStatsThisMonthLoading(false);
    });

    fetchMerchantSpendStats({ id: merchant.id, monthsBack: 3 }).then((data) => {
      setmerchantSpendStats3Months(data);
      setmerchantSpendStats3MonthsLoading(false);
    });

    fetchMerchantSpendStats({ id: merchant.id, monthsBack: 6 }).then((data) => {
      setmerchantSpendStats6Months(data);
      setmerchantSpendStats6MonthsLoading(false);
    });

    fetchMerchantSpendStats({ id: merchant.id, monthsBack: 12 }).then((data) => {
      setmerchantSpendStats12Months(data);
      setmerchantSpendStats12MonthsLoading(false);
    });

    fetchMerchantSpendStats({ id: merchant.id, monthsBack: 24 }).then((data) => {
      setmerchantSpendStatsAllTime(data);
      setmerchantSpendStatsAllTimeLoading(false);
    });
  }, [merchant.id]);


  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">
        {merchant.merchantGroup ? 'Group Spend Summary' : 'Spend Summary'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <SpendSummaryCard
          title="Current Month"
          value={merchantSpendStatsThisMonth?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) || 0}
          loading={merchantSpendStatsThisMonthLoading}
        />

        <SpendSummaryCard
          title="Last 3 Months"
          value={merchantSpendStats3Months?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) || 0}
          loading={merchantSpendStats3MonthsLoading}
        />

        <SpendSummaryCard
          title="Last 6 Months"
          value={merchantSpendStats6Months?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) || 0}
          loading={merchantSpendStats6MonthsLoading}
        />

        <SpendSummaryCard
          title="Last 12 Months"
          value={merchantSpendStats12Months?.monthlySpend.reduce((acc, curr) => acc + curr.amount, 0) || 0}
          loading={merchantSpendStats12MonthsLoading}
        />

        <SpendSummaryCard
          title="All Time"
          value={merchantSpendStatsAllTime?.allTimeSpend.toLocaleString() || 0}
          loading={merchantSpendStatsAllTimeLoading}
        />
      </div>
    </Card>
  )
}

export function SpendSummaryCard({
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
            ${value.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
          </div>
        )}
      </div>
    </ColorBox>
  )
}