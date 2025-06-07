import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page } from "@/utils/types";
import { Table } from "@mantine/core";
import { format as formatDate } from "date-fns";

export function TransactionsTable({
  transactions,
  isLoading,
  error,
  page,
  setPage,
  setPerPage,
  params,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  page: Page;
  setPage: (page: number) => void;
  setPerPage: (per_page: number) => void;
  params: TransactionSearchParams;
}) {
  return (
    <div>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Merchant</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((transaction) => (
            <Table.Tr key={transaction.id}>
              <Table.Td>{formatDate(transaction.date, 'MM/dd/yyyy')}</Table.Td>
              <Table.Td>${transaction.amount.toFixed(2)}</Table.Td>
              <Table.Td>{transaction.merchant.name}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
