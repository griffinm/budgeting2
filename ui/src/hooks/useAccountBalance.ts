import { getAccountBalances } from "@/api";
import { AccountBalance } from "@/utils/types";
import { useEffect, useState } from "react";

interface UseAccountBalancesProps {
  accountBalances: AccountBalance[];
  loading: boolean;
}

export const useAccountBalances = (): UseAccountBalancesProps => {
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccountBalances = async () => {
      setLoading(true);
      getAccountBalances().then((accountBalances) => {
        setAccountBalances(accountBalances);
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        setLoading(false);
      });
    };

    fetchAccountBalances();
  }, []);

  return { accountBalances, loading };
};