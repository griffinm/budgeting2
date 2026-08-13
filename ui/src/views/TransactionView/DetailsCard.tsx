import { Merchant, Tag, Transaction } from "@/utils/types";
import { PlaidAccount } from "@/utils/types";
import { MerchantCategory } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { format } from "date-fns";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { ConfirmTypeButton } from "@/components/TransactionsTable/TableRow/ConfirmTypeButton";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { TransactionTags } from "@/components/TransactionTags/TransactionTags";
import { Badge, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState } from "react";
import "@mantine/dates/styles.css";

interface DetailsCardProps {
  transaction: Transaction;
  merchant: Merchant;
  plaidAccount: PlaidAccount;
  merchantCategories: MerchantCategory[];
  allTags: Tag[];
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  onAddTag: (transactionId: number, tagId: number) => void;
  onRemoveTag: (transactionId: number, transactionTagId: number) => void;
  onCreateAndAddTag: (transactionId: number, name: string) => void;
}

function EditableDate({
  value,
  onSave,
}: {
  value: string;
  onSave: (date: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<Date | null>(new Date(value));
  const pencilClasses = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer";

  const startEditing = () => {
    setNewValue(new Date(value));
    setIsEditing(true);
  };

  const onSubmit = () => {
    if (!newValue) {
      return;
    }
    // Send the picked calendar day; the server stores it at noon.
    onSave(format(newValue, "yyyy-MM-dd"));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-row items-center gap-2">
        <DateInput
          size="xs"
          value={newValue}
          onChange={(date) => setNewValue(date ? new Date(date) : null)}
          aria-label="Transaction date"
        />
        <Button type="button" variant="outline" size="xs" onClick={() => setIsEditing(false)}>Cancel</Button>
        <Button type="button" size="xs" onClick={onSubmit} disabled={!newValue}>Save</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <span>{format(new Date(value), "MMMM d, yyyy")}</span>
      <div className={pencilClasses} onClick={startEditing}>✎</div>
    </div>
  );
}

export function DetailsCard({
  transaction,
  merchant,
  plaidAccount,
  merchantCategories,
  allTags,
  updateTransaction,
  onAddTag,
  onRemoveTag,
  onCreateAndAddTag,
}: DetailsCardProps) {

  function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        <div className="text-sm">{children}</div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <DetailRow label="Account">
          <span>{plaidAccount.nickname || plaidAccount.plaidOfficialName}</span>
        </DetailRow>

        <DetailRow label="Date">
          <EditableDate
            value={transaction.date}
            onSave={(date) => updateTransaction(transaction.id, { date })}
          />
        </DetailRow>

        {transaction.authorizedAt && (
          <DetailRow label="Authorized">
            <span>{format(new Date(transaction.authorizedAt), "MMMM d, yyyy")}</span>
          </DetailRow>
        )}

        <DetailRow label="Type">
          <div className="flex items-center gap-1">
            <TransactionType
              transaction={transaction}
              onSave={(txId, transactionType) =>
                updateTransaction(txId, {
                  transactionType,
                  useAsDefault: false,
                  merchantId: merchant.id,
                })
              }
            />
            <ConfirmTypeButton transaction={transaction} updateTransaction={updateTransaction} />
          </div>
        </DetailRow>

        <DetailRow label="Category">
          <CategoryDisplay
            category={transaction.merchantTag}
            onSave={({ id, useDefaultCategory }) => {
              updateTransaction(transaction.id, {
                merchantCategoryId: id,
                useAsDefault: useDefaultCategory,
                merchantId: merchant.id,
              });
            }}
            allCategories={merchantCategories}
          />
        </DetailRow>

        <DetailRow label="Status">
          {transaction.pending ? (
            <Badge color="yellow" variant="light">Pending</Badge>
          ) : (
            <Badge color="green" variant="light">Posted</Badge>
          )}
        </DetailRow>

        {transaction.checkNumber && (
          <DetailRow label="Check Number">
            <span>{transaction.checkNumber}</span>
          </DetailRow>
        )}

        <DetailRow label="Tags">
          <TransactionTags
            transaction={transaction}
            allTags={allTags}
            onAdd={onAddTag}
            onRemove={onRemoveTag}
            onCreateAndAdd={onCreateAndAddTag}
          />
        </DetailRow>

      </div>
    </>
  );
}