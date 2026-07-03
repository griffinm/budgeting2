import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";

export function needsReview(transaction: Transaction): boolean {
  // Loose == also catches undefined from stale cached rows
  return (
    transaction.classificationSource == null ||
    transaction.classificationSource === "sign_inference"
  );
}

// One-click "this classification is right": re-submitting the current type
// stamps classification_source: 'user', and the refreshed row drops the icon.
export function ConfirmTypeButton({
  transaction,
  updateTransaction,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!needsReview(transaction)) {
    return null;
  }

  return (
    <Tooltip label="Confirm transaction type" withArrow openDelay={300}>
      <ActionIcon
        variant="subtle"
        color="green"
        size="sm"
        loading={loading}
        aria-label="Confirm transaction type"
        onClick={(e) => {
          e.stopPropagation();
          setLoading(true);
          updateTransaction(transaction.id, {
            transactionType: transaction.transactionType,
            useAsDefault: false,
            merchantId: transaction.merchant.id,
          });
        }}
      >
        <IconCheck size={14} />
      </ActionIcon>
    </Tooltip>
  );
}
