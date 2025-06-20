// import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page, MerchantTag } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TableRow } from "./TableRow";

const headers = [
  { label: 'Date', accessor: 'date' },
  { label: 'Amount', accessor: 'amount' },
  { label: 'Merchant', accessor: 'merchant' },
  { label: 'Account', accessor: 'account' },
  { label: 'Type', accessor: 'type' },
  { label: 'Category', accessor: 'category' },
]
export type ColNames = 'date' | 'amount' | 'merchant' | 'account' | 'type' | 'category';

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
      <Table.ScrollContainer minWidth={100}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {headers.filter(header => showCols.includes(header.accessor as ColNames)).map((header) => (
                <Table.Th key={header.accessor}>{header.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                transaction={transaction}
                showCols={showCols}
                updateTransaction={updateTransaction}
                merchantTags={merchantTags}
              />
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
      </Table.ScrollContainer>

    </div>
  );
}
