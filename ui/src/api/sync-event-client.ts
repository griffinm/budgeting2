import { baseClient } from "./base-client";
import { SyncEvent } from "@/utils/types";

export const getLatestSyncEvent = async (): Promise<SyncEvent> => {
  const response = await baseClient.get<SyncEvent>('/sync_events/latest');
  return response.data;
};