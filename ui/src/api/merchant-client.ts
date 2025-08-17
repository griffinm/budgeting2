import { baseClient } from "@/api/base-client";
import { queryStringFromObject } from "@/utils/queryStringFromObject";
import { PageResponse, Merchant, MerchantSpendStats } from "@/utils/types";

export interface UpdateMerchantParams {
  id: number;
  value: Omit<Partial<Merchant>, 'id'>;
}

export interface MerchantSearchParams {
  searchTerm?: string;
  merchantTagId?: number;
  page: { currentPage: number; perPage: number };
}

export const fetchMerchants = async ({
  params
}: {
  params: MerchantSearchParams;
}): Promise<PageResponse<Merchant>> => {
  const { page, ...restParams } = params;
  const url = `/merchants?${queryStringFromObject({ ...restParams, ...page })}`;
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
