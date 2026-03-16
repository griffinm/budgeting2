import { baseClient } from "@/api/base-client";
import { queryStringFromObject } from "@/utils/queryStringFromObject";
import { PageResponse, Merchant, MerchantSpendStats, MerchantGroupSuggestion } from "@/utils/types";

export interface UpdateMerchantParams {
  id: number;
  value: Omit<Partial<Merchant>, 'id'>;
  defaultTagIds?: number[];
  applyToExisting?: boolean;
}

export interface MerchantSearchParams {
  search_term?: string;
  merchant_tag_id?: number;
  merchant_group_id?: number;
  sort_by?: 'name' | 'transaction_count';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export const fetchMerchants = async ({
  params,
}: {
  params: MerchantSearchParams;
}): Promise<PageResponse<Merchant>> => {
  const queryString = queryStringFromObject({...params});
  const url = `/merchants?${queryString}&page=${params.page || 1}`;
  const response = await baseClient.get(url);
  return response.data;
};

export const updateMerchant = async ({
  id,
  value,
  defaultTagIds,
  applyToExisting,
}: UpdateMerchantParams): Promise<Merchant> => {
  const url = `/merchants/${id}`;
  const response = await baseClient.patch(url, {
    merchant: value,
    default_tag_ids: defaultTagIds,
    apply_to_existing: applyToExisting,
  });
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

