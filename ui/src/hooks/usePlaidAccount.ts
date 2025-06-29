import { PlaidAccount } from "@/utils/types";
import { useEffect, useState } from "react";
import { fetchPlaidAccounts as fetchPlaidAccountsApi } from "@/api";

interface PlaidAccountProps {
  plaidAccounts: PlaidAccount[];
  isLoading: boolean;
  error: Error | null;
}

export const usePlaidAccount = (): PlaidAccountProps => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);

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

  return {
    plaidAccounts,
    isLoading: loading,
    error,
  };
};
