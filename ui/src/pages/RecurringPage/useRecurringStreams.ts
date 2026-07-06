import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import {
  fetchRecurringStreams,
  confirmRecurringStream,
  dismissRecurringStream,
  detectRecurringStreams,
  DetectionResult,
} from '@/api/recurring-client';
import { RecurringStream } from '@/utils/types';

export function useRecurringStreams() {
  const [streams, setStreams] = useState<RecurringStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  const loadStreams = useCallback(async () => {
    try {
      const all: RecurringStream[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await fetchRecurringStreams({ page });
        all.push(...response.items);
        totalPages = response.page.totalPages;
        page += 1;
      } while (page <= totalPages);
      setStreams(all);
    } catch (error) {
      console.error('Failed to fetch recurring streams:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load recurring streams',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  const replaceStream = (updated: RecurringStream) => {
    setStreams(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const confirmStream = useCallback(async (id: number) => {
    try {
      replaceStream(await confirmRecurringStream(id));
    } catch (error) {
      console.error('Failed to confirm recurring stream:', error);
      notifications.show({ title: 'Error', message: 'Failed to confirm stream', color: 'red' });
    }
  }, []);

  const dismissStream = useCallback(async (id: number) => {
    try {
      replaceStream(await dismissRecurringStream(id));
      notifications.show({
        title: 'Stream dismissed',
        message: "It won't be suggested again and its transactions are no longer marked recurring.",
        color: 'gray',
      });
    } catch (error) {
      console.error('Failed to dismiss recurring stream:', error);
      notifications.show({ title: 'Error', message: 'Failed to dismiss stream', color: 'red' });
    }
  }, []);

  const runDetection = useCallback(async (): Promise<DetectionResult | null> => {
    setIsDetecting(true);
    try {
      const result = await detectRecurringStreams();
      await loadStreams();
      notifications.show({
        title: 'Detection complete',
        message: `${result.created} new suggestion${result.created === 1 ? '' : 's'}, ${result.updated} updated`,
        color: result.created > 0 ? 'green' : 'blue',
      });
      return result;
    } catch (error) {
      console.error('Failed to run recurring detection:', error);
      notifications.show({ title: 'Error', message: 'Detection failed', color: 'red' });
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [loadStreams]);

  return { streams, isLoading, isDetecting, confirmStream, dismissStream, runDetection };
}
