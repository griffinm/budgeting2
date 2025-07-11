import { PlaidAccount, User } from "@/utils/types";
import { useContext, useEffect, useState } from "react";
import { 
  fetchPlaidAccounts as fetchPlaidAccountsApi,
  addUserToPlaidAccount,
  removeUserFromPlaidAccount,
} from "@/api";
import { NotificationContext } from "@/providers";

interface PlaidAccountProps {
  plaidAccounts: PlaidAccount[];
  isLoading: boolean;
  error: Error | null;
  updateAccountAccess: (props: ChangeAccountAccessProps) => Promise<void>;
}

export interface ChangeAccountAccessProps {
  user: User;
  plaidAccount: PlaidAccount;
  isAuthorized: boolean;
}

export const usePlaidAccount = (): PlaidAccountProps => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const fetchPlaidAccounts = async () => {
      setLoading(true);
      fetchPlaidAccountsApi()
        .then(setPlaidAccounts)
        .catch((error: Error) => setError(error))
        .finally(() => setLoading(false));
    };

    fetchPlaidAccounts();
  }, []);

  const updateAccountAccess = async ({ user, plaidAccount, isAuthorized }: ChangeAccountAccessProps) => {
    if (isAuthorized) {
      await addUserToPlaidAccount({ plaidAccountId: plaidAccount.id.toString(), userId: user.id.toString() });
    } else {
      await removeUserFromPlaidAccount({ plaidAccountId: plaidAccount.id.toString(), userId: user.id.toString() });
    }
    const message = `${user.firstName} ${isAuthorized ? "has been granted access" : "has been removed from"} ${plaidAccount.nickname}`;
    const title = isAuthorized ? "Account access updated" : "Account access removed";
    const type = isAuthorized ? "success" : "error";
    showNotification({
      title,
      message,
      type,
    });
  }

  return {
    plaidAccounts,
    isLoading: loading,
    error,
    updateAccountAccess,
  };
};
