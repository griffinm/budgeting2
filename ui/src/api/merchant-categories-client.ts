import { baseClient } from "@/api/base-client";
import { MerchantCategory, MerchantCategorySpendStats } from "@/utils/types";
import { format } from "date-fns";

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
  const response = await baseClient.post('/merchant_tags', { merchant_tag: data });
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

export type MerchantCategorySpendSummary = {
  tags: MerchantCategory[];
  uncategorizedTotal: number;
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
}): Promise<MerchantCategorySpendStats[]> => {
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

// Dates are sent as date-only strings so the backend's day-granularity
// filtering isn't skewed by the client timezone.
export const fetchMerchantCategorySpendSummary = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): Promise<MerchantCategorySpendSummary> => {
  const params = {
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  };
  const response = await baseClient.get('/merchant_tags/spend_stats', { params });
  return response.data;
};

export const fetchMerchantCategoryMonthlySpendStats = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): Promise<MerchantCategorySpendStats[]> => {
  const params = {
    group_by: 'month',
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  };
  const response = await baseClient.get('/merchant_tags/spend_stats', { params });
  return response.data;
};
