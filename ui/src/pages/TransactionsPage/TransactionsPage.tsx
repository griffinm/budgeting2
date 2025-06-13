import { useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantTag } from '@/utils/types';
import { fetchMerchantTags } from '@/api';

export default function TransactionsPage() {
  const { 
    transactions,
    isLoading,
    error,
    page,
    setPage,
    setPerPage,
    searchParams,
    setSearchParams,
    updateTransaction,
  } = useTransactions();
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const setTitle = usePageTitle();
  
  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  useEffect(() => {
    fetchMerchantTags()
      .then(setMerchantTags)
      .catch(console.error);
  }, []);

  return (
    <div>
      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        error={error}
        page={page}
        setPage={setPage}
        setPerPage={setPerPage}
        searchParams={searchParams}
        onSetSearchParams={setSearchParams}
        updateTransaction={updateTransaction}
        merchantTags={merchantTags}
      />
    </div>
  );
}
