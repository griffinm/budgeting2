import { MerchantTag, Tag, Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { FullRow } from "./FullRow";
import { CondensedRow } from "./CondensedRow";

export function TableRow({
  transaction,
  condensed,
  updateTransaction,
  merchantTags,
  allTags,
  addTransactionTag,
  removeTransactionTag,
  createAndAddTag,
}: {
  transaction: Transaction;
  condensed?: boolean;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
  allTags: Tag[];
  addTransactionTag: (transactionId: number, tagId: number) => void;
  removeTransactionTag: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag: (transactionId: number, name: string) => void;
}) {
  return (
    <>
      {condensed ? (
        <CondensedRow
          transaction={transaction}
          updateTransaction={updateTransaction}
        />
      ) : (
        <FullRow
          transaction={transaction}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
          allTags={allTags}
          addTransactionTag={addTransactionTag}
          removeTransactionTag={removeTransactionTag}
          createAndAddTag={createAndAddTag}
        />
      )}
    </>
  )
}
