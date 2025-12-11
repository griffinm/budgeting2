import { PlaidAccount, User } from "@/utils/types";
import { Card, Checkbox, Text } from "@mantine/core";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {plaidAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            user={currentUser}
            currentUser={currentUser}
            onChange={onAccountAccessChange}
            accountUsersLoading={accountUsersLoading}
            accountUsers={accountUsers}
            onAccountAccessChange={onAccountAccessChange}
            onNicknameChange={onNicknameChange}
          />
        ))}
      </div>
    </div>
  );
};

function AccountCard({
  account,
  currentUser,
  accountUsersLoading,
  accountUsers,
  onAccountAccessChange,
  onNicknameChange,
}: {
  account: PlaidAccount;
  user: User;
  currentUser: User;
  onChange: (props: ChangeAccountAccessProps) => void;
  accountUsersLoading: boolean;
  accountUsers: User[];
  onAccountAccessChange: (props: ChangeAccountAccessProps) => void;
  onNicknameChange: (id: number, nickname: string) => Promise<void>;
}) {
  return (
    <Card padding="sm" className="hover-bounce">
      <Card.Section withBorder pb="sm">
        <div className="flex flex-col gap-2">
          <EditableLabel
            additionalClasses="text-black text-lg font-bold"
            id={account.id}
            value={account.nickname || account.plaidOfficialName}
            onSave={onNicknameChange}
          />
          <div className="flex flex-row gap-2 justify-between">
            <Text size="sm" c="dimmed">
              ****{account.plaidMask}
            </Text>
            <Text size="sm" c="dimmed">
              Type: {account.plaidType}
            </Text>
          </div>
        </div>
      </Card.Section>

      <Card.Section withBorder pt="sm">
        <Text size="sm" fw={500} mb="sm">
          Authorized Users:
        </Text>
          <div className="flex flex-col gap-2">
            {accountUsersLoading || !accountUsers ? (
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
      </Card.Section>
    </Card>
  );
}

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
