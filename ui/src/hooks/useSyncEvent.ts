import { useState, useEffect } from 'react';
import { getLatestSyncEvent } from '@/api';
import { SyncEvent } from '@/utils/types';

interface SyncEventProps {
  latestSyncEvent?: SyncEvent;
  isLoading: boolean;
  error?: string[];
}

export const useSyncEvent: () => SyncEventProps = () => {
  const [latestSyncEvent, setLatestSyncEvent] = useState<SyncEvent | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError([]);

    getLatestSyncEvent()
      .then((syncEvent) => {
        setLatestSyncEvent(syncEvent);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return {
    latestSyncEvent,
    isLoading,
    error,
  };
}