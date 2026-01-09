import { useEffect, useState } from "react";
import { Modal, Select } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LineChart } from "@mantine/charts";
import { getAccountBalanceHistory, getAccountTypeBalanceHistory } from "@/api";
import { AccountBalanceHistory, AccountType, TimeRange } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { format } from 'date-fns';

interface AccountBalanceHistoryModalProps {
  plaidAccountId?: number | null;
  accountType?: AccountType | null;
  accountName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AccountBalanceHistoryModal({
  plaidAccountId,
  accountType,
  accountName,
  isOpen,
  onClose,
}: AccountBalanceHistoryModalProps) {
  const [balanceHistory, setBalanceHistory] = useState<AccountBalanceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    if (!isOpen) return;

    if (plaidAccountId) {
      fetchBalanceHistory(plaidAccountId, timeRange);
    } else if (accountType) {
      fetchTypeBalanceHistory(accountType, timeRange);
    }
  }, [plaidAccountId, accountType, timeRange, isOpen]);

  const fetchBalanceHistory = async (accountId: number, range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccountBalanceHistory(accountId, range);
      setBalanceHistory(data);
    } catch (err) {
      console.error('Failed to fetch balance history:', err);
      setError('Failed to load balance history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypeBalanceHistory = async (type: AccountType, range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccountTypeBalanceHistory(type, range);
      setBalanceHistory(data);
    } catch (err) {
      console.error('Failed to fetch type balance history:', err);
      setError('Failed to load balance history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = balanceHistory.map((item) => ({
    date: format(new Date(item.createdAt), 'MMM d, yyyy'),
    balance: parseFloat(String(item.currentBalance)),
  }));

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Balance History - ${accountName}`}
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Select
            size="xs"
            value={timeRange}
            onChange={(value) => setTimeRange(value as TimeRange)}
            data={[
              { value: '1m', label: '1 Month' },
              { value: '3m', label: '3 Months' },
              { value: '6m', label: '6 Months' },
              { value: '12m', label: '12 Months' },
              { value: 'all', label: 'All Time' },
            ]}
            label="Time Range"
          />
        </div>

        {loading ? (
          <Loading fullHeight={false} />
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : balanceHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No historical data available for this time period.
          </div>
        ) : (
          <LineChart
            h={350}
            data={chartData}
            dataKey="date"
            series={[
              { name: 'balance', color: 'blue', label: 'Balance' },
            ]}
            curveType="monotone"
            withLegend={false}
            withDots={true}
            strokeWidth={2}
            valueFormatter={(value: number) =>
              `$${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }
          />
        )}
      </div>
    </Modal>
  );
}
