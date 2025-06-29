import { PlaidAccount } from "@/utils/types";
import { Table } from "@mantine/core";
import "./styles.css";

interface AccountTableProps {
  plaidAccounts: PlaidAccount[];
  onUpdateAccount: (account: PlaidAccount) => void;
}

export const AccountTable = ({ 
  plaidAccounts,
}: AccountTableProps) => {
  return (
    <div className="w-full">
      <Table className="account-table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Account Number</Table.Th>
            <Table.Th>Type</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {plaidAccounts.map((account) => (
            <Table.Tr key={account.id}>
              <Table.Td>{account.nickname}</Table.Td>
              <Table.Td>****{account.plaidMask}</Table.Td>
              <Table.Td>{account.plaidType}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};
