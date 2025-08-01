import { baseClient } from "@/api/base-client";
import { MerchantTag } from "@/utils/types";

export type CreateMerchantTagRequest = Omit<Partial<MerchantTag>, 'id' | 'createdAt' | 'updatedAt' | 'children'>;

export type UpdateMerchantTagRequest = {
  id: number;
  data: CreateMerchantTagRequest;
};

export type DeleteMerchantTagRequest = {
  id: number;
};

export type FetchMerchantTagsRequest = {
  id: number;
  data: CreateMerchantTagRequest;
};

export type FetchMerchantTagSpendStatsRequest = {
  tagId?: number;
  startDate?: Date;
  endDate?: Date;
};

export const fetchMerchantTags = async (): Promise<MerchantTag[]> => {
  const response = await baseClient.get('/merchant_tags');
  return response.data;
};

export const fetchMerchantTag = async ({
  tagId,
}: {
  tagId: number;
}): Promise<MerchantTag> => {
  const response = await baseClient.get(`/merchant_tags/${tagId}`);
  return response.data;
};

export const createMerchantTag = async ({
  data,
}: {
  data: CreateMerchantTagRequest;
}): Promise<MerchantTag> => {
  const response = await baseClient.post('/merchant_tags', data);
  return response.data;
};

export const updateMerchantTag = async ({
  data,
}: {
  data: UpdateMerchantTagRequest;
}): Promise<MerchantTag> => {
  const response = await baseClient.put(`/merchant_tags/${data.id}`, data);
  return response.data;
};

export const deleteMerchantTag = async ({
  id,
}: {
  id: number;
}): Promise<void> => {
  await baseClient.delete(`/merchant_tags/${id}`);
};

export const fetchMerchantTagSpendStats = async ({
  tagId,
  startDate,
  endDate,
}: {
  tagId?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<MerchantTag[]> => {
  let url = `/merchant_tags/spend_stats`;
  if (tagId) {
    url = `/merchant_tags/${tagId}/spend_stats`;
  }

  const response = await baseClient.get(url, { params: { start_date: startDate, end_date: endDate } });
  return response.data;
};
