export interface FormatDollarsOptions {
  /** true → always two decimal places; false (default) → whole dollars */
  cents?: boolean;
  /** auto (default): -$X / $X by sign · never: $|X| · explicit: +$X / -$X */
  sign?: 'auto' | 'never' | 'explicit';
}

export function formatDollars(
  value: number,
  { cents = false, sign = 'auto' }: FormatDollarsOptions = {},
): string {
  const digits = cents ? 2 : 0;
  const magnitude = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  let prefix = '';
  if (sign === 'auto' && value < 0) prefix = '-';
  if (sign === 'explicit') prefix = value < 0 ? '-' : '+';

  return `${prefix}$${magnitude}`;
}

/** Returns a formatter suitable for Mantine chart `valueFormatter` props. */
export function chartCurrencyFormatter(
  options: FormatDollarsOptions = {},
): (value: number) => string {
  return (value: number) => formatDollars(value, options);
}
