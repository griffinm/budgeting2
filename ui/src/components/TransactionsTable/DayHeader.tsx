import { Transaction } from "@/utils/types";
import { Currency } from "../Currency";

export function DayHeader({ 
  date,
  transactions,
}: {
  date: string;
  transactions: Transaction[];
}) {
  const transactionCount = transactions.length;
  const filteredTransactions = transactions.filter((transaction) => transaction.transactionType !== 'transfer');
  const totalAmount = filteredTransactions.reduce((acc, transaction) => acc + (transaction.amount * -1), 0);

  return (
    <div className="sticky-header flex flex-row justify-between">
      <h3 className="text-sm font-medium text-gray-700">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </h3>
        {transactionCount > 0 && (
          <div>
            <span className="text-xs text-gray-500 mr-3">
              {transactionCount} transaction{transactionCount > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500 font-bold">
              <Currency amount={totalAmount} applyColor={false} useBold={false} />
            </span>
          </div>
        )}
    </div>
  )
}
