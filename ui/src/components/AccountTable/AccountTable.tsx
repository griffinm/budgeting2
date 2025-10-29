import { PlaidAccount, User } from "@/utils/types";
import { Checkbox, Table } from "@mantine/core";
import "./styles.css";
import { ChangeAccountAccessProps } from "@/hooks";
import { useEffect, useState } from "react";
import { EditableLabel } from "@/components/EditableLabel/EditableLabel";

export function AccountTable({
  plaidAccounts,
  accountUsers,
  accountUsersLoading,
  currentUser,
  onAccountAccessChange,
  onNicknameChange,
}: {
  plaidAccounts: PlaidAccount[];
  accountUsers: User[];
  accountUsersLoading: boolean;
  currentUser: User;
  onAccountAccessChange: (props: ChangeAccountAccessProps) => void;
  onNicknameChange: (id: number, nickname: string) => Promise<void>;
}) {
  return (
    <div className="w-full">
      <Table className="account-table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Account Number</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Authorized Users</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {plaidAccounts.map((account) => (
            <Table.Tr key={account.id}>
              <Table.Td>
                <EditableLabel
                  id={account.id}
                  value={account.nickname || account.plaidOfficialName}
                  onSave={onNicknameChange}
                />
              </Table.Td>
              <Table.Td>****{account.plaidMask}</Table.Td>
              <Table.Td>{account.plaidType}</Table.Td>
              <Table.Td>
                <div className="flex flex-col gap-4">
                  {accountUsersLoading ? (
                    <div>Loading...</div>
                  ) : (
                    accountUsers.map((user) => {
                      return (
                        <AccountAccessCheckbox
                          key={user.id}
                          user={user}
                          account={account}
                          currentUser={currentUser}
                          onChange={onAccountAccessChange}
                        />
                      );
                    })
                  )}
                </div>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

function AccountAccessCheckbox({
  account,
  user,
  currentUser,
  onChange,
}: {
  account: PlaidAccount;
  currentUser: User;
  user: User;
  onChange: (props: ChangeAccountAccessProps) => void;
}) {
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setIsChecked(currentUser.id === user.id || account.users.some((u) => u.id === user.id));
  }, [currentUser, user, account]);

  const handleChange = () => {
    setIsChecked(!isChecked);
    onChange({ user, plaidAccount: account, isAuthorized: !isChecked });
  }

  return (
    <div>
      <Checkbox
        label={`${user.firstName}`}
        checked={isChecked}
        onChange={handleChange}
        disabled={currentUser.id === user.id}
      />
    </div>
  );
}
