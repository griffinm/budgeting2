import { usePageTitle } from "@/hooks";
import { useContext, useEffect } from "react";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { AccountTable } from "@/components/AccountTable";
import { useAccount, usePlaidAccount } from "@/hooks";
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';

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
      <h1 className="text-2xl font-bold mb-5">Accounts</h1>
      <div className="mt-4 border border-gray-200 rounded-md shadow-sm">
        <AccountTable
          plaidAccounts={plaidAccounts}
          accountUsers={accountUsers}
          accountUsersLoading={accountUsersLoading}
          currentUser={user!}
          onAccountAccessChange={updateAccountAccess}
        />
      </div>
    </div>
  );
}
