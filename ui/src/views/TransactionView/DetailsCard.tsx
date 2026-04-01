import { Merchant, Tag, Transaction } from "@/utils/types";
import { PlaidAccount } from "@/utils/types";
import { MerchantCategory } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { format } from "date-fns";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { TransactionTags } from "@/components/TransactionTags/TransactionTags";
import { Badge } from "@mantine/core";

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
          <span>{format(new Date(transaction.date), "MMMM d, yyyy")}</span>
        </DetailRow>

        {transaction.authorizedAt && (
          <DetailRow label="Authorized">
            <span>{format(new Date(transaction.authorizedAt), "MMMM d, yyyy")}</span>
          </DetailRow>
        )}

        <DetailRow label="Type">
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