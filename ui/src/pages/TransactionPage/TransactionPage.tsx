import { useCallback, useEffect, useMemo, useState } from "react";
import { TransactionView } from "@/views/TransactionView";
import { usePageTitle } from "@/hooks";
import { Transaction } from "@/utils/types";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { getTransaction, updateTransaction as updateTransactionApi, TransactionUpdateParams } from "@/api/transaction-client";
import { Loading } from "@/components/Loading";


export default function TransactionPage() {
    const { id: transactionId } = useParams();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const setTitle = usePageTitle();

    const formattedPageTitle = useMemo(() => {
      if (!transaction) {
        return 'Transaction';
      }
      return `${merchantDisplayName(transaction.merchant)} - ${format(new Date(transaction.date), "MMM d, yyyy")} | Budgeting`;
    }, [transaction]);

    useEffect(() => {
      setLoading(true);
      getTransaction({ id: Number(transactionId) })
        .then(setTransaction)
        .finally(() => setLoading(false));
    }, [transactionId]);

    useEffect(() => {
      if (transaction) {
        setTitle(formattedPageTitle);
      }
    }, [setTitle, formattedPageTitle, transaction]);

    const updateTransaction = useCallback((id: number, params: TransactionUpdateParams) => {
      updateTransactionApi({ id, params }).then(setTransaction);
    }, []);

    if (loading || !transaction) {
      return <Loading />;
    }

  return <TransactionView transaction={transaction} setTransaction={setTransaction} updateTransaction={updateTransaction} />;
}
