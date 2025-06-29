import { usePlaidAccount } from "@/hooks/usePlaidAccount";
import { usePageTitle } from "@/hooks";
import { useEffect } from "react";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { AccountTable } from "@/components/AccountTable";

export default function AccountsPage() {
  const { plaidAccounts, isLoading } = usePlaidAccount();
  const setTitle = usePageTitle();

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
        <AccountTable plaidAccounts={plaidAccounts} onUpdateAccount={() => {}} />
      </div>
    </div>
  );
}
