import { useContext, useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantTag } from '@/utils/types';
import { 
  fetchMerchantTags, 
  updateAllPlaidAccounts as updateAllPlaidAccountsApi,
} from '@/api';
import { useSyncEvent } from '@/hooks/useSyncEvent';
import { format as formatDate } from 'date-fns';
import { Button, Card } from '@mantine/core';
import { NotificationContext } from '@/providers';

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
  const { 
    latestSyncEvent,
    isLoading: isSyncEventLoading,
  } = useSyncEvent();
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const setTitle = usePageTitle();
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  useEffect(() => {
    fetchMerchantTags()
      .then(setMerchantTags)
      .catch(console.error);
  }, []);

  const updateAllPlaidAccounts = () => {
    updateAllPlaidAccountsApi().then((response) => {
      if (response.message === 'update_queued') {
        showNotification({
          title: 'Update queued',
          message: 'Transactions will be updated in the background',
          type: 'success',
        });
      } else if (response.message === 'update_already_queued') {
        showNotification({
          title: 'Update already queued',
          message: 'Transactions are already being updated',
          type: 'error',
        });
      } else if (response.message === 'update_not_needed') {
        showNotification({
          title: 'Update not needed',
          message: 'Transactions were last updated at ' + formatDate(response.last_sync_time, 'MM/dd/yyyy hh:mm a'),
          type: 'info',
        });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-3">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          
          <div>
            {isSyncEventLoading ? <div>Loading...</div> : latestSyncEvent ? (
              <>Last synced at: <strong>{formatDate(latestSyncEvent.startedAt, 'MM/dd/yyyy hh:mm a')}</strong></>
            ) : (
              <em>Transactions not yet synced</em>
            )}
          </div>

          <Button variant="subtle" size="xs" color="gray" onClick={() => updateAllPlaidAccounts()}>Update Now</Button>
        </div>
      </div>
      <Card>
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

      </Card>
    </div>
  );
}
