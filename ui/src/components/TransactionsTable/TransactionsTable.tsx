// import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { format as formatDate } from "date-fns";
import { Search } from "./Search";

const headers = [
  { label: 'Date', accessor: 'date' },
  { label: 'Amount', accessor: 'amount' },
  { label: 'Merchant', accessor: 'merchant' },
  { label: 'Account', accessor: 'account' },
]

export function TransactionsTable({
  transactions,
  isLoading,
  error,
  page,
  setPage,
  setPerPage,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  page: Page;
  setPage: (page: number) => void;
  setPerPage: (per_page: number) => void;
}) {

  return (
    <div>
      <div className="mb-3">
        <Search />
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
                {formatDate(transaction.date, 'MM/dd/yyyy')}
              </Table.Td>
              <Table.Td>
                ${transaction.amount.toFixed(2)}
              </Table.Td>
              <Table.Td>{transaction.merchant.name}</Table.Td>
              <Table.Td>{transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}</Table.Td>
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
