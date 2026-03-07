import classNames from 'classnames';

export function TransactionAmount({ amount, showCents = true }: { amount: number, showCents?: boolean }) {
  const isNegative = amount < 0;
  const minFractionDigits = showCents ? 2 : 0;
  const maxFractionDigits = showCents ? 2 : 0;
  const amountClass = classNames('font-semibold', {
    'text-neutral-600 dark:text-neutral-300': !isNegative,
    'text-black dark:text-white': isNegative,
  });
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits });

  return (
    <div className={amountClass}>
      {formattedAmount}
    </div>
  );
}
