import { useEffect, useState } from "react";
import { MerchantTag, Transaction } from "@/utils/types";
import { fetchMerchantTag, getTransactionsForMerchantTag } from "@/api";
import { useParams } from "react-router-dom";
import { useMerchantTags } from "@/hooks";

export function useMerchantTagPageData() {
  const { id: merchantTagId } = useParams();
  const [merchantTag, setMerchantTag] = useState<MerchantTag | null>(null);
  const [merchantTagLoading, setMerchantTagLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactionPageCount, setTransactionPageCount] = useState(0);
  const { 
    rawMerchantTags: merchantTags,
    loading: merchantTagsLoading,
  } = useMerchantTags();

  useEffect(() => {
    setMerchantTagLoading(true);
    fetchMerchantTag(Number(merchantTagId))
      .then((tag) => setMerchantTag(tag))
      .finally(() => setMerchantTagLoading(false));
  }, [merchantTagId]);

  useEffect(() => {
    setTransactionsLoading(true);
    getTransactionsForMerchantTag({ merchantTagId: Number(merchantTagId) })
      .then((transactions) => {
        setTransactions(transactions.items);
        setTransactionCount(transactions.page.totalCount);
        setTransactionPageCount(transactions.page.totalPages);
      })
      .finally(() => setTransactionsLoading(false));
  }, [merchantTagId, transactionsPage]);

  return { 
    merchantTag, 
    merchantTagLoading, 
    transactions,
    transactionsLoading,
    transactionsPage,
    setTransactionsPage,
    transactionCount,
    transactionPageCount,
    merchantTags,
    merchantTagsLoading,
  };
}