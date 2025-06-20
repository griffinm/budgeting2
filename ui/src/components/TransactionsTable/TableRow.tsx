import { MerchantTag, Transaction } from "@/utils/types";
import { ColNames } from "./TransactionsTable";
import { Table } from "@mantine/core";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { format as formatDate } from "date-fns";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { Link } from "react-router-dom";
import { TransactionUpdateParams } from "@/api/transaction-client";

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
  return (
    <Table.Tr>
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
  );
}