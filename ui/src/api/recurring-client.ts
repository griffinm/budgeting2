import { baseClient } from "@/api/base-client";
import { PageResponse, RecurringStream, RecurringStreamStatus } from "@/utils/types";

export interface RecurringStreamParams {
  status?: RecurringStreamStatus;
  active?: boolean;
  page?: number;
  per_page?: number;
}

export interface DetectionResult {
  message: string;
  created: number;
  updated: number;
  skipped_dismissed: number;
}

export const fetchRecurringStreams = async (
  params: RecurringStreamParams = {},
): Promise<PageResponse<RecurringStream>> => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.active !== undefined) query.set('active', String(params.active));
  query.set('page', String(params.page || 1));
  query.set('perPage', String(params.per_page || 200));
  const response = await baseClient.get(`/recurring_streams?${query.toString()}`);
  return response.data;
};

export const confirmRecurringStream = async (id: number): Promise<RecurringStream> => {
  const response = await baseClient.patch(`/recurring_streams/${id}/confirm`);
  return response.data;
};

export const dismissRecurringStream = async (id: number): Promise<RecurringStream> => {
  const response = await baseClient.patch(`/recurring_streams/${id}/dismiss`);
  return response.data;
};

export const detectRecurringStreams = async (): Promise<DetectionResult> => {
  const response = await baseClient.post(`/recurring_streams/detect`);
  return response.data;
};
