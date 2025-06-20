import { MerchantTag, Transaction } from "@/utils/types";
import { ColNames } from "./TransactionsTable";
import { Button, Input, Table } from "@mantine/core";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { format as formatDate } from "date-fns";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { Link } from "react-router-dom";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { useState } from "react";

export function TableRow({
  transaction,
  showCols,
  updateTransaction,
  merchantTags,
}: {
  transaction: Transaction;
  showCols: ColNames[];
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState(transaction.note || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateTransaction(transaction.id, { note });
    setIsEditingNote(false);
  };

  return (
    <>
      <Table.Tr style={{ borderBottom: 'none' }}>
        {showCols.includes('date') && (
          <Table.Td>
            {formatDate(transaction.date, 'M/d/yy')}
          </Table.Td>
        )}
        
        {showCols.includes('amount') && (
          <Table.Td>
            <TransactionAmount amount={transaction.amount} />
          </Table.Td>
        )}

        {showCols.includes('merchant') && (
          <Table.Td>
            <Link to={urls.merchant.path(transaction.merchant.id)} className="hover:underline cursor-pointer">
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </Table.Td>
        )}

        {showCols.includes('account') && (
          <Table.Td>
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </Table.Td>
        )}

        {showCols.includes('type') && (
          <Table.Td w={150}>
            <TransactionType
              transaction={transaction}
              onSave={(id, transactionType) => updateTransaction(id, { transactionType })}
            />
          </Table.Td>
        )}

        {showCols.includes('category') && (
          <Table.Td>
            <CategoryDisplay
              category={transaction.merchantTag}
              onSave={newTagId => updateTransaction(transaction.id, { merchantTagId: newTagId })}
              allCategories={merchantTags}
            />
          </Table.Td>
        )}
      </Table.Tr>

      {isEditingNote ? (
        <Table.Tr style={{ borderTop: 'none' }}>
          <Table.Td colSpan={showCols.length}>
            <form onSubmit={handleSubmit} className="flex flex-row gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} autoFocus className="flex-1" />
              <Button type="button" variant="outline" onClick={() => setIsEditingNote(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </form>
          </Table.Td>
        </Table.Tr>
      ) : (
        <Table.Tr style={{ borderTop: 'none' }}>
          <Table.Td colSpan={showCols.length}>
            {
              transaction.note ? (
                <span className="text-gray-500 cursor-pointer text-sm" onClick={() => setIsEditingNote(true)}>{transaction.note}</span>
              ) : (
                <span className="text-gray-500 cursor-pointer text-sm" onClick={() => setIsEditingNote(true)}>Add Note</span>
              )
            }
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
}