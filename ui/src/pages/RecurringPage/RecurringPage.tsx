import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Tabs } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { Loading } from "@/components/Loading";
import { RecurringStream, RecurringStreamStatus } from "@/utils/types";
import { useRecurringStreams } from "./useRecurringStreams";
import { RecurringSummary } from "./RecurringSummary";
import { StreamRow } from "./StreamRow";

const EMPTY_MESSAGES: Record<RecurringStreamStatus, string> = {
  suggested: "No suggestions to review — detection runs automatically after every sync.",
  confirmed: "Nothing confirmed yet. Review the Suggested tab to start tracking subscriptions and bills.",
  dismissed: "Nothing dismissed.",
};

export default function RecurringPage() {
  const setTitle = usePageTitle();
  const { streams, isLoading, isDetecting, confirmStream, dismissStream, runDetection } = useRecurringStreams();
  const [activeTab, setActiveTab] = useState<RecurringStreamStatus>('suggested');
  const hasAutoSelectedTab = useRef(false);

  useEffect(() => {
    setTitle(urls.recurring.title());
  }, [setTitle]);

  // Land on the tab where the work is: the review queue while it has items,
  // otherwise the confirmed list.
  useEffect(() => {
    if (isLoading || hasAutoSelectedTab.current) return;
    hasAutoSelectedTab.current = true;
    if (!streams.some(s => s.status === 'suggested') && streams.some(s => s.status === 'confirmed')) {
      setActiveTab('confirmed');
    }
  }, [isLoading, streams]);

  const byStatus = useMemo(() => {
    const sorted: Record<RecurringStreamStatus, RecurringStream[]> = {
      suggested: streams.filter(s => s.status === 'suggested').sort((a, b) => b.confidence - a.confidence),
      confirmed: streams
        .filter(s => s.status === 'confirmed')
        .sort((a, b) => Number(b.active) - Number(a.active) || a.predictedNextDate.localeCompare(b.predictedNextDate)),
      dismissed: streams.filter(s => s.status === 'dismissed'),
    };
    return sorted;
  }, [streams]);

  const visibleStreams = byStatus[activeTab];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex-shrink-0">
        <RecurringSummary streams={streams} loading={isLoading} />
      </div>

      <Card p={0} className="flex-1 min-h-0 flex flex-col">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as RecurringStreamStatus)}>
          <Tabs.List className="px-2 pt-1 flex-wrap">
            <Tabs.Tab value="suggested">
              Suggested{byStatus.suggested.length > 0 && ` (${byStatus.suggested.length})`}
            </Tabs.Tab>
            <Tabs.Tab value="confirmed">
              Confirmed{byStatus.confirmed.length > 0 && ` (${byStatus.confirmed.length})`}
            </Tabs.Tab>
            <Tabs.Tab value="dismissed">
              Dismissed{byStatus.dismissed.length > 0 && ` (${byStatus.dismissed.length})`}
            </Tabs.Tab>
            <div className="ml-auto flex items-center pr-2 pb-1">
              <Button
                variant="subtle"
                color="gray"
                size="compact-sm"
                leftSection={<IconRefresh size={14} />}
                loading={isDetecting}
                onClick={runDetection}
              >
                Run detection
              </Button>
            </div>
          </Tabs.List>
        </Tabs>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <Loading fullHeight={false} />
          ) : visibleStreams.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              {EMPTY_MESSAGES[activeTab]}
            </div>
          ) : (
            visibleStreams.map(stream => (
              <StreamRow
                key={stream.id}
                stream={stream}
                onConfirm={confirmStream}
                onDismiss={dismissStream}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
