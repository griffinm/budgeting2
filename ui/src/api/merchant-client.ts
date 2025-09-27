import { baseClient } from "@/api/base-client";
import { queryStringFromObject } from "@/utils/queryStringFromObject";
import { PageResponse, Merchant, MerchantSpendStats, PageRequestParams, MerchantGroupSuggestion } from "@/utils/types";

export interface UpdateMerchantParams {
  id: number;
  value: Omit<Partial<Merchant>, 'id'>;
}

export interface MerchantSearchParams {
  searchTerm?: string;
  merchantTagId?: number;
  merchantGroupId?: number;
  page?: PageRequestParams;
}

export interface CreateMerchantGroupParams {
  groupName: string;
  description?: string;
}

export const fetchMerchants = async ({
  params,
}: {
  params: MerchantSearchParams;
}): Promise<PageResponse<Merchant>> => {
  const queryString = `page=${params.page?.page || 1}&per_page=${params.page?.perPage || 25}&${queryStringFromObject({...params})}`;
  const url = `/merchants?${queryString}`;
  const response = await baseClient.get(url);
  return response.data;
};

export const updateMerchant = async ({
  id,
  value,
}: UpdateMerchantParams): Promise<Merchant> => {
  const url = `/merchants/${id}`;
  const response = await baseClient.patch(url, { merchant: value });
  return response.data;
};

export const fetchMerchant = async ({
  id,
}: {
  id: number;
}): Promise<Merchant> => {
  const url = `/merchants/${id}`;
  const response = await baseClient.get(url);
  return response.data;
};

export const fetchMerchantSpendStats = async ({
  id,
  monthsBack = 6,
}: {
  id: number;
  monthsBack?: number;
}): Promise<MerchantSpendStats> => {
  const url = `/merchants/${id}/spend_stats?months_back=${monthsBack}`;
  const response = await baseClient.get(url);
  return response.data;
};

export const fetchMerchantGroupSuggestions = async (merchantId: number): Promise<MerchantGroupSuggestion[]> => {
  const url = `/merchants/${merchantId}/suggest_groups`;
  const response = await baseClient.get(url);
  return response.data.suggestions;
};

export const createMerchantGroup = async (merchantId: number, params: CreateMerchantGroupParams): Promise<{ message: string; group: { id: number; name: string; description: string | null } }> => {
  const url = `/merchants/${merchantId}/create_group`;
  const response = await baseClient.post(url, params);
  return response.data;
};
