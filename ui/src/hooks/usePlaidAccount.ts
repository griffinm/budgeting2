import { PlaidAccount, User } from "@/utils/types";
import { useContext, useEffect, useState, useCallback } from "react";
import { 
  fetchPlaidAccounts as fetchPlaidAccountsApi,
  addUserToPlaidAccount,
  removeUserFromPlaidAccount,
  updatePlaidAccountNickname as updatePlaidAccountNicknameApi,
  updatePlaidAccountArchived as updatePlaidAccountArchivedApi,
} from "@/api";
import { NotificationContext } from "@/providers";

interface PlaidAccountProps {
  plaidAccounts: PlaidAccount[];
  isLoading: boolean;
  error: Error | null;
  updateAccountAccess: (props: ChangeAccountAccessProps) => Promise<void>;
  updatePlaidAccountNickname: (id: number, nickname: string) => Promise<void>;
  setPlaidAccountArchived: (plaidAccount: PlaidAccount, archived: boolean) => Promise<void>;
  refreshAccounts: () => Promise<void>;
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

  const fetchPlaidAccounts = useCallback(async () => {
    setLoading(true);
    fetchPlaidAccountsApi()
      .then(setPlaidAccounts)
      .catch((error: Error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPlaidAccounts();
  }, [fetchPlaidAccounts]);

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

  const updatePlaidAccountNickname = async (id: number, nickname: string) => {
    await updatePlaidAccountNicknameApi({ plaidAccountId: id, nickname });
    showNotification({
      title: "Account nickname updated",
      message: `Account nickname updated to "${nickname}"`,
      type: "success",
    });
    await fetchPlaidAccounts();
  };

  const setPlaidAccountArchived = async (plaidAccount: PlaidAccount, archived: boolean) => {
    await updatePlaidAccountArchivedApi({ plaidAccountId: plaidAccount.id, archived });
    const name = plaidAccount.nickname || plaidAccount.plaidOfficialName;
    showNotification({
      title: archived ? "Account archived" : "Account restored",
      message: archived
        ? `${name} will no longer sync. Its history is still available.`
        : `${name} will resume syncing.`,
      type: "success",
    });
    await fetchPlaidAccounts();
  };

  const refreshAccounts = async () => {
    await fetchPlaidAccounts();
  };

  return {
    plaidAccounts,
    isLoading: loading,
    error,
    updateAccountAccess,
    updatePlaidAccountNickname,
    setPlaidAccountArchived,
    refreshAccounts,
  };
};
