import { baseClient } from "@/api/base-client";
import { queryStringFromObject } from "@/utils/queryStringFromObject";
import { PageResponse, Merchant } from "@/utils/types";

export interface MerchantSearchParams {
  searchTerm?: string;
}

export const fetchMerchants = async ({
  params
}: {
  params: MerchantSearchParams;
}): Promise<PageResponse<Merchant>> => {
  const url = `/merchants?${queryStringFromObject({...params})}`;
  const response = await baseClient.get(url);
  return response.data;
};

export const updateMerchant = async ({
  id,
  merchant,
}: {
  id: number;
  merchant: Partial<Merchant>;
}): Promise<Merchant> => {
  const url = `/merchants/${id}`;
  const response = await baseClient.patch(url, { merchant });
  return response.data;
};