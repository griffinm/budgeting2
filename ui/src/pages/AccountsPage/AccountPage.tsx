import { usePageTitle } from "@/hooks";
import { useContext, useEffect } from "react";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { AccountTable } from "@/components/AccountTable";
import { useAccount, usePlaidAccount } from "@/hooks";
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { Card } from "@mantine/core";

export default function AccountsPage() {
  const { plaidAccounts, isLoading } = usePlaidAccount();
  const setTitle = usePageTitle();
  const { user } = useContext(CurrentUserContext);
  const { 
    loading: accountUsersLoading,
    users: accountUsers,
    setAccountId,
  } = useAccount();
  const { updateAccountAccess } = usePlaidAccount();

  useEffect(() => {
    if (user) {
      setAccountId(user.accountId);
    }
  }, [user, setAccountId]);

  useEffect(() => {
    setTitle(urls.accounts.title());
  }, [setTitle]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Connected Bank Accounts</h1>
      <Card className="no-padding">
        <AccountTable
          plaidAccounts={plaidAccounts}
          accountUsers={accountUsers}
          accountUsersLoading={accountUsersLoading}
          currentUser={user!}
          onAccountAccessChange={updateAccountAccess}
        />
      </Card>
    </div>
  );
}
