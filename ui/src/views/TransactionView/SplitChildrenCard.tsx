import { Link } from "react-router-dom";
import { Alert, Button, Card } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAlertTriangle, IconArrowsSplit } from "@tabler/icons-react";
import { Transaction } from "@/utils/types";
import { urls } from "@/utils/urls";
import { formatDollars } from "@/utils/currencyUtils";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";

export function SplitChildrenCard({
  transaction,
  onEditSplit,
  onUnsplit,
}: {
  transaction: Transaction;
  onEditSplit: () => void;
  onUnsplit: () => void;
}) {
  const children = transaction.childTransactions || [];
  const childrenTotal = children.reduce((sum, child) => sum + child.amount, 0);
  const outOfSync = Math.abs(childrenTotal - transaction.amount) >= 0.005;

  const confirmUnsplit = () => {
    modals.openConfirmModal({
      title: 'Unsplit transaction',
      children: 'This removes the split transactions and restores the original. Any categories set on the splits will be lost.',
      labels: { confirm: 'Unsplit', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: onUnsplit,
    });
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <IconArrowsSplit className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Split into {children.length} transactions</h2>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="xs" onClick={onEditSplit}>
            Edit split
          </Button>
          <Button variant="outline" size="xs" color="gray" onClick={confirmUnsplit}>
            Unsplit
          </Button>
        </div>
      </div>

      {outOfSync && (
        <Alert color="orange" variant="light" className="mb-4">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="w-4 h-4 text-orange-500" />
            <span>
              The splits total {formatDollars(childrenTotal, { cents: true })}, but this transaction
              is {formatDollars(transaction.amount, { cents: true })} (the amount changed after it was
              split). Edit the split to fix the amounts.
            </span>
          </div>
        </Alert>
      )}

      <div className="flex flex-col">
        {children.map((child) => (
          <Link
            key={child.id}
            to={urls.transaction.path(child.id)}
            className="flex items-center gap-3 py-2 px-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] rounded-md transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{child.name}</span>
              {child.merchantTag && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{child.merchantTag.name}</span>
              )}
            </div>
            <div className="ml-auto">
              <TransactionAmount amount={child.amount} transactionType={child.transactionType} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
