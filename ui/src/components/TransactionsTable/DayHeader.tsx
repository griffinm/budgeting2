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
  const filteredTransactions = transactions.filter((transaction) => {
    const isNotTransfer = transaction.transactionType !== 'transfer';
    return isNotTransfer
  });
  const totalAmount = filteredTransactions.reduce((acc, transaction) => acc + (transaction.amount * -1), 0);

  return (
    <div className="sticky top-0 z-10 border-b bg-neutral-100 dark:bg-[var(--mantine-color-dark-6)] border-gray-300 dark:border-gray-600 py-2 px-3 flex flex-row justify-between">
      
      {/* Desktop display */}
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </h3>

      {/* Mobile display */}
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 visible md:hidden">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </h3>
        {transactionCount > 0 && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
              {transactionCount} transaction{transactionCount > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              <Currency amount={totalAmount} applyColor={false} useBold={false} />
            </span>
          </div>
        )}
    </div>
  )
}
