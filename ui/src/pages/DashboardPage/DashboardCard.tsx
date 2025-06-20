import { Transaction, TransactionType } from "@/utils/types";
import { Blockquote } from "@mantine/core";
import { Loading } from "@/components/Loading/Loading";
import { getPercentChangeForCurrentDay } from '@/utils/chartUtils';

export function DashboardCard({
  currentMonthTransactions,
  previousMonthTransactions,
  transactionType,
  loading,
}: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  transactionType: TransactionType;
  loading: boolean;
}) {
  const isNegativeGood = transactionType !== 'expense';
  const cardColor = isNegativeGood ? 'red' : 'green';

  return (
    <div className="max-w-xs">
    <Blockquote className="bg-gray-100 p-4 rounded-lg" color={cardColor}>
      <h3 className="text-md mb-2">
        {transactionType === 'expense' ? 'Expenses' : 'Income'} Performance MoM
      </h3>
      {loading && <Loading fullHeight={false} />}
      {!loading && (
        <p className="text-3xl text-gray-500 font-bold">
          {getPercentChangeForCurrentDay({
          transactionsThisMonth: currentMonthTransactions,
          transactionsLastMonth: previousMonthTransactions,
          currentDay: new Date().getDate(),
          transactionType,
        }) + '%'}
        </p>
      )}
    </Blockquote>
  </div>
  )
}