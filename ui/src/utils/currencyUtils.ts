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

/**
 * Compact dollar formatting for chart axis ticks, e.g. 60000 → "$60.0k",
 * 1_500_000 → "$1.5M". Values under 1,000 are shown in full ("$950").
 */
export function formatCompactDollars(
  value: number,
  { sign = 'auto' }: Pick<FormatDollarsOptions, 'sign'> = {},
): string {
  const abs = Math.abs(value);
  let magnitude: string;
  if (abs >= 1_000_000) {
    magnitude = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    magnitude = `${(abs / 1_000).toFixed(1)}k`;
  } else {
    magnitude = abs.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  let prefix = '';
  if (sign === 'auto' && value < 0) prefix = '-';
  if (sign === 'explicit') prefix = value < 0 ? '-' : '+';

  return `${prefix}$${magnitude}`;
}

/** Returns a compact currency formatter suitable for chart axis `tickFormatter` props. */
export function chartCompactCurrencyFormatter(
  options: Pick<FormatDollarsOptions, 'sign'> = {},
): (value: number) => string {
  return (value: number) => formatCompactDollars(value, options);
}
