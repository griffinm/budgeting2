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
    'text-[#555]': !applyColor,
  });
  const minFractionDigits = showCents ? 2 : 0;
  const maxFractionDigits = showCents ? 2 : 0;

  return (
    <span className={classes}>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits }).format(amount)}
    </span>
  )
}
