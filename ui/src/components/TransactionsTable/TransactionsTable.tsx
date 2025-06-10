// import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { format as formatDate } from "date-fns";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TransactionAmount } from "../TransactionAmount/TransactionAmount";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { TransactionType } from "@/components/TransactionType";
import { Link } from "react-router-dom";
import { urls } from "@/utils/urls";

const headers = [
  { label: 'Date', accessor: 'date' },
  { label: 'Amount', accessor: 'amount' },
  { label: 'Merchant', accessor: 'merchant' },
  { label: 'Account', accessor: 'account' },
  { label: 'Type', accessor: 'type' },
]

export function TransactionsTable({
  transactions,
  isLoading,
  page,
  setPage,
  searchParams,
  onSetSearchParams,
  updateTransaction,
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
}) {
  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} transactions`}
        </div>
        <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} />
      </div>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {headers.map((header) => (
              <Table.Th key={header.accessor}>{header.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((transaction) => (
            <Table.Tr key={transaction.id}>
              <Table.Td>
                {formatDate(transaction.date, 'M/d/yy')}
              </Table.Td>
              <Table.Td>
                <TransactionAmount amount={transaction.amount} />
              </Table.Td>
              <Table.Td>
                <Link to={urls.merchant.path(transaction.merchant.id)} className="hover:underline cursor-pointer">
                  {merchantDisplayName(transaction.merchant)}
                </Link>
              </Table.Td>
              <Table.Td>
                {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
              </Table.Td>
              <Table.Td w={150}>
                <TransactionType
                  transaction={transaction}
                  onSave={(id, transactionType) => updateTransaction(id, { transactionType })}
                />
              </Table.Td>
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
