import classNames from 'classnames';
import { formatDollars } from '@/utils/currencyUtils';

export function Currency({
  amount,
  applyColor = true,
  useBold = true,
  showCents = true,
}: {
  amount: number;
  applyColor?: boolean;
  useBold?: boolean;
  showCents?: boolean;
}) {
  const isNegative = amount < 0;
  const classes = classNames({
    'font-bold': useBold,
    'text-red-500': applyColor && isNegative,
    'text-green-500': applyColor && !isNegative,
    'text-gray-600 dark:text-gray-400': !applyColor,
  });
  return (
    <span className={classes}>
      {formatDollars(amount, { cents: showCents })}
    </span>
  )
}
