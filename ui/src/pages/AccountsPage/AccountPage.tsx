import { usePageTitle } from "@/hooks";
import { useContext, useEffect } from "react";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { AccountTable } from "@/components/AccountTable";
import { useAccount, usePlaidAccount } from "@/hooks";
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { ConnectPlaidAccount } from "@/components/ConnectPlaidAccount";

export default function AccountsPage() {
  const { plaidAccounts, isLoading, refreshAccounts, updateAccountAccess, updatePlaidAccountNickname } = usePlaidAccount();
  const setTitle = usePageTitle();
  const { user } = useContext(CurrentUserContext);
  const { 
    loading: accountUsersLoading,
    users: accountUsers,
    setAccountId,
  } = useAccount();

  useEffect(() => {
    if (user) {
      setAccountId(user.accountId);
    }
  }, [user, setAccountId]);

  useEffect(() => {
    setTitle(urls.accounts.title());
  }, [setTitle]);

  const handleConnectionSuccess = async () => {
    await refreshAccounts();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Connected Bank Accounts</h1>
        <ConnectPlaidAccount onSuccess={handleConnectionSuccess} />
      </div>
      <AccountTable
        plaidAccounts={plaidAccounts}
        accountUsers={accountUsers}
        accountUsersLoading={accountUsersLoading}
        currentUser={user!}
        onAccountAccessChange={updateAccountAccess}
        onNicknameChange={updatePlaidAccountNickname}
      />
    </div>
  );
}
