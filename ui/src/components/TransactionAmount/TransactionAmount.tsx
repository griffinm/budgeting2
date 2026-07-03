import classNames from 'classnames';
import { formatDollars } from '@/utils/currencyUtils';
import { TransactionType } from '@/utils/types';

export function TransactionAmount({
  amount,
  transactionType,
  showCents = true,
}: {
  amount: number;
  transactionType?: TransactionType;
  showCents?: boolean;
}) {
  const isNegative = amount < 0;
  const isIncome = transactionType === 'income';
  const isTransfer = transactionType === 'transfer';
  const amountClass = classNames('font-semibold', {
    'text-green-600 dark:text-green-400': isIncome,
    'text-gray-400 dark:text-gray-500': isTransfer,
    'text-neutral-600 dark:text-neutral-300': !isIncome && !isTransfer && !isNegative,
    'text-black dark:text-white': !isIncome && !isTransfer && isNegative,
  });

  // Income renders its money direction explicitly: negative raw amounts are
  // money in (Plaid convention) → "+$X"; a positive amount is a reversal.
  const sign = isIncome ? (amount <= 0 ? '+' : '-') : '';
  const formattedAmount = formatDollars(amount, { cents: showCents, sign: 'never' });

  return (
    <div className={amountClass}>
      {sign}{formattedAmount}
    </div>
  );
}
