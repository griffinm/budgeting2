import { RecurringFrequency, RecurringStream } from "@/utils/types";

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  annually: 'Yearly',
};

export const FREQUENCY_BADGE_COLORS: Record<RecurringFrequency, string> = {
  weekly: 'cyan',
  biweekly: 'teal',
  monthly: 'blue',
  annually: 'violet',
};

const FREQUENCY_MONTHLY_FACTOR: Record<RecurringFrequency, number> = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1,
  annually: 1 / 12,
};

/** A stream's cost normalized to a per-month amount (signed: income is negative). */
export function monthlyAmount(stream: RecurringStream): number {
  return stream.averageAmount * FREQUENCY_MONTHLY_FACTOR[stream.frequency];
}
