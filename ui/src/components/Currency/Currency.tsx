import classNames from 'classnames';

export function Currency({ 
  amount,
  applyColor = true,
  useBold = true,
}: {
  amount: number;
  applyColor?: boolean;
  useBold?: boolean;
}) {
  const isNegative = amount < 0;
  const classes = classNames({
    'font-bold': useBold,
    'text-red-500': applyColor && isNegative,
    'text-green-500': applyColor && !isNegative,
  });

  return (
    <span className={classes}>
      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}