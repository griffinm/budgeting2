// import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page, MerchantTag } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { format as formatDate } from "date-fns";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TransactionAmount } from "../TransactionAmount/TransactionAmount";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { TransactionType } from "@/components/TransactionType";
import { Link } from "react-router-dom";
import { urls } from "@/utils/urls";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";

const headers = [
  { label: 'Date', accessor: 'date' },
  { label: 'Amount', accessor: 'amount' },
  { label: 'Merchant', accessor: 'merchant' },
  { label: 'Account', accessor: 'account' },
  { label: 'Type', accessor: 'type' },
  { label: 'Category', accessor: 'category' },
]
type ColNames = 'date' | 'amount' | 'merchant' | 'account' | 'type' | 'category';

export function TransactionsTable({
  transactions,
  isLoading,
  page,
  setPage,
  searchParams,
  onSetSearchParams,
  updateTransaction,
  merchantTags,
  showCols = ['date', 'amount', 'merchant', 'account', 'type', 'category'],
  showSearch = true,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  page: Page;
  setPage: (page: number) => void;
  setPerPage: (per_page: number) => void;
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
  showCols?: ColNames[];
  showSearch?: boolean;
}) {
  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} transactions`}
        </div>
        {showSearch && (
          <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} />
        )}
      </div>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {headers.filter(header => showCols.includes(header.accessor as ColNames)).map((header) => (
              <Table.Th key={header.accessor}>{header.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((transaction) => (
            <Table.Tr key={transaction.id}>
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
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={headers.length}>
              {page && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    total={page.totalPages}
                    value={page.currentPage}
                    onChange={setPage}
                    withEdges
                    withControls
                  />
                </div>
              )}
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>

    </div>
  );
}
