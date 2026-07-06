import { useState } from "react";
import { ActionIcon, Badge, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { RecurringStream } from "@/utils/types";
import { Logo } from "@/components/TransactionsTable/Logo";
import { Link } from "@/components/Link";
import { urls } from "@/utils/urls";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { formatDollars } from "@/utils/currencyUtils";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { FREQUENCY_LABELS, FREQUENCY_BADGE_COLORS, monthlyAmount } from "./frequencyUtils";

export function StreamRow({
  stream,
  onConfirm,
  onDismiss,
}: {
  stream: RecurringStream;
  onConfirm: (id: number) => Promise<void>;
  onDismiss: (id: number) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const isIncome = stream.averageAmount < 0;
  const perMonth = monthlyAmount(stream);

  const act = async (action: (id: number) => Promise<void>) => {
    setBusy(true);
    try {
      await action(stream.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`group relative w-full border-b border-gray-100 dark:border-[var(--mantine-color-dark-4)] hover:bg-gray-50 dark:hover:bg-[var(--mantine-color-dark-6)] transition-colors ${stream.status === 'dismissed' ? 'opacity-60' : ''}`}>
      {/* Hover accent rail — echoes the sidebar's active indicator */}
      <span className="pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] bg-primary-400 dark:bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-row items-center gap-3 px-4 py-2.5">
        {/* Logo */}
        <div className="h-[40px] w-[40px] flex-shrink-0 hidden md:flex items-center">
          <Logo merchant={stream.merchant} />
        </div>

        {/* Merchant + cadence details */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-sm font-semibold truncate leading-tight">
            <Link to={urls.merchant.path(stream.merchant.id)}>
              {merchantDisplayName(stream.merchant)}
            </Link>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {stream.occurrenceCount} payments since {dayjs(stream.firstDate).format('MMM YYYY')}
            {stream.frequency !== 'monthly' && ` · ≈ ${formatDollars(Math.abs(perMonth), { cents: true })}/mo`}
          </span>
        </div>

        {/* Frequency */}
        <div className="hidden sm:block flex-shrink-0 w-[110px]">
          <Badge variant="light" color={FREQUENCY_BADGE_COLORS[stream.frequency]} size="sm">
            {FREQUENCY_LABELS[stream.frequency]}
          </Badge>
        </div>

        {/* Confidence — only meaningful while a stream is a suggestion */}
        <div className="hidden lg:block flex-shrink-0 w-[70px] text-right">
          {stream.status === 'suggested' && (
            <Tooltip withArrow position="top" label="Detection confidence">
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                {Math.round(stream.confidence * 100)}% match
              </span>
            </Tooltip>
          )}
        </div>

        {/* Next expected date, or when it lapsed */}
        <div className="hidden sm:block flex-shrink-0 w-[110px] text-right">
          {stream.active ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Next {dayjs(stream.predictedNextDate).format('MMM D')}
            </span>
          ) : (
            <Tooltip withArrow position="top" label={`Last seen ${dayjs(stream.lastDate).format('MMM D, YYYY')}`}>
              <Badge variant="light" color="gray" size="sm">Lapsed</Badge>
            </Tooltip>
          )}
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 w-[90px] text-right">
          <TransactionAmount amount={stream.averageAmount} transactionType={isIncome ? 'income' : 'expense'} />
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 w-[60px] justify-end">
          {stream.status === 'suggested' && (
            <Tooltip withArrow position="top" label="Confirm — mark these transactions recurring">
              <ActionIcon variant="light" color="green" size="md" loading={busy} onClick={() => act(onConfirm)}>
                <IconCheck size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {stream.status !== 'dismissed' && (
            <Tooltip withArrow position="top" label="Dismiss — never suggest this again">
              <ActionIcon variant="subtle" color="gray" size="md" loading={busy && stream.status !== 'suggested'} onClick={() => act(onDismiss)}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
