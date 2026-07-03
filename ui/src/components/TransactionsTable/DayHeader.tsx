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
    <div className="sticky top-0 z-10 flex flex-row items-center justify-between gap-3 border-b border-gray-100 dark:border-[var(--mantine-color-dark-4)] bg-white/80 dark:bg-[var(--mantine-color-dark-7)]/80 backdrop-blur-sm px-4 py-2">

      {/* Desktop display */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:block">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </h3>

      {/* Mobile display */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 visible md:hidden">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </h3>
        {transactionCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {transactionCount} transaction{transactionCount > 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold tabular-nums">
              <Currency amount={totalAmount} applyColor={true} useBold={false} />
            </span>
          </div>
        )}
    </div>
  )
}
