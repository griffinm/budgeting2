import { MerchantTag, Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { FullRow } from "./FullRow";
import { CondensedRow } from "./CondensedRow";

export function TableRow({
  transaction,
  condensed,
  updateTransaction,
  merchantTags,
}: {
  transaction: Transaction;
  condensed?: boolean;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
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
        />
      )}
    </>
  )
}
