import classNames from 'classnames';
import { formatDollars } from '@/utils/currencyUtils';

export function TransactionAmount({ amount, showCents = true }: { amount: number, showCents?: boolean }) {
  const isNegative = amount < 0;
  const amountClass = classNames('font-semibold', {
    'text-neutral-600 dark:text-neutral-300': !isNegative,
    'text-black dark:text-white': isNegative,
  });
  const formattedAmount = formatDollars(amount, { cents: showCents, sign: 'never' });

  return (
    <div className={amountClass}>
      {formattedAmount}
    </div>
  );
}
