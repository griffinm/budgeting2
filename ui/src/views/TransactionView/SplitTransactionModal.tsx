import { useContext, useEffect, useState } from "react";
import { ActionIcon, Button, Modal, NumberInput, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import classNames from "classnames";
import { MerchantCategory, Transaction } from "@/utils/types";
import { splitTransaction } from "@/api/transaction-client";
import { formatDollars } from "@/utils/currencyUtils";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { NotificationContext } from "@/providers/Notification/NotificationContext";

interface SplitRow {
  key: number;
  name: string;
  amount: number | string;
  category: MerchantCategory | null;
}

const SUM_TOLERANCE = 0.005;

export function SplitTransactionModal({
  transaction,
  merchantCategories,
  opened,
  onClose,
  onSplit,
}: {
  transaction: Transaction;
  merchantCategories: MerchantCategory[];
  opened: boolean;
  onClose: () => void;
  onSplit: (transaction: Transaction) => void;
}) {
  const { showNotification } = useContext(NotificationContext);
  const [rows, setRows] = useState<SplitRow[]>([]);
  const [saving, setSaving] = useState(false);

  // Re-seed the form every time the modal opens: pre-fill from the existing
  // children when editing a split, otherwise start with two empty rows.
  useEffect(() => {
    if (!opened) return;

    const children = transaction.childTransactions || [];
    if (transaction.split && children.length > 0) {
      setRows(children.map((child, index) => ({
        key: index,
        name: child.name,
        amount: child.amount,
        category: child.merchantTag || null,
      })));
    } else {
      setRows([
        { key: 0, name: transaction.name, amount: '', category: null },
        { key: 1, name: transaction.name, amount: '', category: null },
      ]);
    }
  }, [opened, transaction]);

  const updateRow = (key: number, updates: Partial<SplitRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...updates } : row)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: Math.max(...prev.map((r) => r.key)) + 1, name: transaction.name, amount: '', category: null },
    ]);
  };

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const allocated = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const remainder = Math.round((transaction.amount - allocated) * 100) / 100;
  const amountsValid = rows.every((row) => Number(row.amount) !== 0 && row.amount !== '');
  const canSave = rows.length >= 2 && amountsValid && Math.abs(remainder) < SUM_TOLERANCE;

  const assignRemainderToLastRow = () => {
    const last = rows[rows.length - 1];
    if (!last) return;
    const newAmount = Math.round(((Number(last.amount) || 0) + remainder) * 100) / 100;
    updateRow(last.key, { amount: newAmount });
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    splitTransaction({
      id: transaction.id,
      children: rows.map((row) => ({
        amount: Number(row.amount),
        name: row.name,
        merchantCategoryId: row.category?.id || null,
      })),
    })
      .then((updated) => {
        showNotification({
          title: 'Transaction split',
          message: `Split into ${rows.length} transactions.`,
          type: 'success',
        });
        onSplit(updated);
        onClose();
      })
      .catch((error) => {
        const errors = error.response?.data?.errors;
        showNotification({
          title: 'Error',
          message: Array.isArray(errors) ? errors.join(' ') : 'Failed to split transaction.',
          type: 'error',
        });
      })
      .finally(() => setSaving(false));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={transaction.split ? 'Edit split' : 'Split transaction'}
      centered
      size="lg"
    >
      <form onSubmit={onFormSubmit}>
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Split {formatDollars(transaction.amount, { cents: true })} into separate transactions.
            The amounts must add up to the original amount.
          </div>

          {rows.map((row) => (
            <div key={row.key} className="flex items-start gap-2">
              <TextInput
                className="flex-1"
                placeholder="Name"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
              />
              <NumberInput
                className="w-32"
                placeholder="Amount"
                decimalScale={2}
                fixedDecimalScale
                hideControls
                value={row.amount}
                onChange={(value) => updateRow(row.key, { amount: value })}
              />
              <div className="w-44">
                <CategoryDisplay
                  category={row.category}
                  onSave={({ id }) => {
                    updateRow(row.key, { category: merchantCategories.find((c) => c.id === id) || null });
                  }}
                  allCategories={merchantCategories}
                />
              </div>
              <ActionIcon
                variant="subtle"
                color="gray"
                className="mt-1"
                disabled={rows.length <= 2}
                onClick={() => removeRow(row.key)}
                aria-label="Remove row"
              >
                <IconTrash className="w-4 h-4" />
              </ActionIcon>
            </div>
          ))}

          <div>
            <Button variant="subtle" size="xs" leftSection={<IconPlus className="w-4 h-4" />} onClick={addRow}>
              Add row
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
            <div
              className={classNames('text-sm font-medium', {
                'text-green-600 dark:text-green-400': Math.abs(remainder) < SUM_TOLERANCE,
                'text-red-600 dark:text-red-400': Math.abs(remainder) >= SUM_TOLERANCE,
              })}
            >
              Remaining: {formatDollars(remainder, { cents: true })}
              {Math.abs(remainder) >= SUM_TOLERANCE && (
                <Button variant="subtle" size="compact-xs" className="ml-2" onClick={assignRemainderToLastRow}>
                  Assign to last row
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" color="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="outline" size="xs" disabled={!canSave} loading={saving}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
