import { MerchantTag, Transaction } from "@/utils/types";
import { Button, Input } from "@mantine/core";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { Link } from "@/components/Link";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { useState } from "react";
import { Logo } from "./Logo";

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
        <CondensedTableRow
          transaction={transaction}
          updateTransaction={updateTransaction}
        />
      ) : (
        <FullTableRow
          transaction={transaction}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
        />
      )}
    </>
  )
}

function CondensedTableRow({
  transaction,
  updateTransaction,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}) {
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-row flex-1">
        <div className="flex flex-col w-1/3">
          <span className="text-lg">
            <TransactionAmount amount={transaction.amount} />
          </span>
        </div>
        <div className="flex flex-col w-1/3">
          <span className="text-sm text-gray-500">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>
      </div>

      <Note transaction={transaction} updateTransaction={updateTransaction} />
    </div>
  );
}

function FullTableRow({
  transaction,
  updateTransaction,
  merchantTags,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
}) {
  return (
    <div className="w-full relative border-b border-gray-300 pt-2 hover:bg-gray-100 transition-colors">
      <div className="px-3 flex flex-row">
        <div className="flex flex-col w-1/3">
          <span className="text-lg">
            <TransactionAmount amount={transaction.amount} />
          </span>

          <span className="text-sm text-gray-500">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>
        <div className="h-[50px] w-[50px] flex items-center mr-3">
          <Logo merchant={transaction.merchant} />
        </div>

        <div className="flex flex-col w-1/3">
          <div className="text-sm">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <div>
            <TransactionType
              transaction={transaction}
              onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
            />
          </div>
        </div>

        <div className="w-1/3 h-full pb-2 min-h-[60px]">
          <CategoryDisplay
            category={transaction.merchantTag}
            onSave={({ id, useDefaultCategory }) => {
              updateTransaction(transaction.id, { merchantTagId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
            }}
            allCategories={merchantTags}
          />
        </div>
      </div>
    </div>
  )
}

function Note({
  transaction,
  updateTransaction,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState(transaction.note || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateTransaction(transaction.id, { note });
    setIsEditingNote(false);
  };

  if (isEditingNote) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <Input value={note} onChange={(e) => setNote(e.target.value)} autoFocus className="flex-1" />
        <Button type="button" variant="outline" onClick={() => setIsEditingNote(false)}>Cancel</Button>
        <Button type="submit">Save</Button>
      </form>
    )
  }

  return (
    <div>
      {
        transaction.note ? (
          <span className="text-sm text-gray-500 cursor-pointer" onClick={() => setIsEditingNote(true)}>{transaction.note}</span>
        ) : (
          <span className="text-sm text-gray-500 cursor-pointer" onClick={() => setIsEditingNote(true)}>Add Note</span>
        )
      }
    </div>
  )
}
