import { baseClient } from "@/api/base-client";
import { MerchantCategory, MerchantCategorySpendStats } from "@/utils/types";

export type CreateMerchantCategoryRequest = Omit<Partial<MerchantCategory>, 'id' | 'createdAt' | 'updatedAt' | 'children'>;

export type UpdateMerchantCategoryRequest = {
  id: number;
  data: CreateMerchantCategoryRequest;
};

export type DeleteMerchantCategoryRequest = {
  id: number;
};

export type FetchMerchantCategoriesRequest = {
  id: number;
  data: CreateMerchantCategoryRequest;
};

export type FetchMerchantCategorySpendStatsRequest = {
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
};

export const fetchMerchantCategories = async (): Promise<MerchantCategory[]> => {
  const response = await baseClient.get('/merchant_tags');
  return response.data;
};

export const fetchMerchantCategory = async ({
  categoryId,
}: {
  categoryId: number;
}): Promise<MerchantCategory> => {
  const response = await baseClient.get(`/merchant_tags/${categoryId}`);
  return response.data;
};

export const createMerchantCategory = async ({
  data,
}: {
  data: CreateMerchantCategoryRequest;
}): Promise<MerchantCategory> => {
  const response = await baseClient.post('/merchant_tags', data);
  return response.data;
};

export const updateMerchantCategory = async ({
  data,
}: {
  data: UpdateMerchantCategoryRequest;
}): Promise<MerchantCategory> => {
  const response = await baseClient.put(`/merchant_tags/${data.id}`, { merchant_tag: data.data });
  return response.data;
};

export const deleteMerchantCategory = async ({
  id,
}: {
  id: number;
}): Promise<void> => {
  await baseClient.delete(`/merchant_tags/${id}`);
};

export const fetchMerchantCategorySpendStats = async ({
  categoryId,
  startDate,
  endDate,
  monthsBack,
}: {
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  monthsBack?: number;
}): Promise<MerchantCategorySpendStats[] | MerchantCategory[]> => {
  let url = `/merchant_tags/spend_stats`;
  if (categoryId) {
    url = `/merchant_tags/${categoryId}/spend_stats`;
  }
  const params = {
    start_date: startDate,
    end_date: endDate,
    months_back: monthsBack,
  };
  const response = await baseClient.get(url, { params });
  return response.data;
};
