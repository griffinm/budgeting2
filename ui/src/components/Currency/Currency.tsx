import classNames from 'classnames';

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
  });

  return (
    <span className={classes}>
      ${amount.toLocaleString('en-US', { minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 })}
    </span>
  )
}