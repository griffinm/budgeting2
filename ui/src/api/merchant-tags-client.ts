import { baseClient } from "@/api/base-client";
import { MerchantTag } from "@/utils/types";

export type CreateMerchantTagRequest = Omit<Partial<MerchantTag>, 'id' | 'createdAt' | 'updatedAt' | 'children'>;

export const fetchMerchantTags = async (): Promise<MerchantTag[]> => {
  const response = await baseClient.get('/merchant_tags');
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
  id,
  data,
}: {
  id: number;
  data: CreateMerchantTagRequest;
}): Promise<MerchantTag> => {
  const response = await baseClient.put(`/merchant_tags/${id}`, data);
  return response.data;
};

export const deleteMerchantTag = async ({
  id,
}: {
  id: number;
}): Promise<void> => {
  await baseClient.delete(`/merchant_tags/${id}`);
};