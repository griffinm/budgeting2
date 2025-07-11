import { useEffect, useState } from "react";
import { User } from "@/utils/types";
import {
  fetchAccountUsers,
} from "@/api";



interface AccountProps {
  loading: boolean;
  users: User[];
  setAccountId: (accountId: string) => void;
}

export const useAccount = (): AccountProps => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    setLoading(true);
    fetchAccountUsers({ accountId })
      .then((users) => {
        setUsers(users);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accountId]);

  return { loading, users, setAccountId, };
}
