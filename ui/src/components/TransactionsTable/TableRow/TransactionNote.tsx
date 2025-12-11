import { Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { Button, Input } from "@mantine/core";
import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

export function TransactionNote({
  transaction,
  updateTransaction,
  isEditing,
  onCancel,
  onEdit,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  isEditing: boolean;
  onCancel: () => void;
  onEdit: () => void;
}) {
  const [note, setNote] = useState(transaction.note ?? '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateTransaction(transaction.id, { note });
    onCancel();
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-row gap-2 w-full">
          <div className="flex-1">
            <Input
              size="xs"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={onCancel}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>
          <Button size="xs" type="submit" leftSection={<IconCheck size={16} />}>Save</Button>
        </div>
      </form>
    )
  }
  return (
    <div
      className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
      onClick={onEdit}
    >
      {transaction.note}
    </div>
  )
}