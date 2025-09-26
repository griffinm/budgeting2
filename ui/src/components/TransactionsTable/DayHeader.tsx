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
  const totalAmount = transactions.reduce((acc, transaction) => acc + (transaction.amount * -1), 0);

  return (
    <div className="sticky top-0 z-10 border-b bg-neutral-100 border-gray-300 py-2 px-3 flex flex-row justify-between">
      <h3 className="text-sm font-medium text-gray-700">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h3>
        {transactionCount > 0 && (
          <div>
            <span className="text-xs text-gray-500">
              {transactionCount} transactions
            </span>
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
