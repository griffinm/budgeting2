import classNames from 'classnames';

export function TransactionAmount({ amount }: { amount: number }) {
  const isNegative = amount < 0;
  const amountClass = classNames('font-semibold', {
    'text-red-400': !isNegative,
    'text-green-400': isNegative,
  });
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className={amountClass}>
      {formattedAmount}
    </div>
  );
}