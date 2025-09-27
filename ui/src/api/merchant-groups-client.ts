import { baseClient } from "@/api/base-client";
import { MerchantGroup, MerchantSpendStats } from "@/utils/types";

export interface CreateMerchantGroupParams {
  name: string;
  description?: string;
}

export const fetchMerchantGroups = async (): Promise<MerchantGroup[]> => {
  const response = await baseClient.get<MerchantGroup[]>('/merchant_groups');
  return response.data;
};

export const fetchMerchantGroupSpendStats = async ({
  id,
  monthsBack = 6,
}: {
  id: number;
  monthsBack?: number;
}): Promise<MerchantSpendStats> => {
  const response = await baseClient.get<MerchantSpendStats>(`/merchant_groups/${id}/spend_stats?months_back=${monthsBack}`);
  return response.data;
};

export const createMerchantGroup = async (merchantId: number, params: CreateMerchantGroupParams): Promise<MerchantGroup> => {
  const response = await baseClient.post(`/merchants/${merchantId}/create_group`, params);
  // The response only contains partial group data, so we need to fetch the full group
  const groupId = response.data.group.id;
  const fullGroups = await fetchMerchantGroups();
  return fullGroups.find((g: MerchantGroup) => g.id === groupId)!;
};

export const addMerchantToGroup = async (groupId: number, merchantId: number): Promise<void> => {
  await baseClient.post(`/merchant_groups/${groupId}/add_merchant`, { merchant_id: merchantId });
};

export const removeMerchantFromGroup = async (groupId: number, merchantId: number): Promise<void> => {
  await baseClient.delete(`/merchant_groups/${groupId}/remove_merchant`, { 
    data: { merchant_id: merchantId } 
  });
};

export const setPrimaryMerchant = async (groupId: number, merchantId: number): Promise<void> => {
  await baseClient.patch(`/merchant_groups/${groupId}/set_primary_merchant`, { 
    merchant_id: merchantId 
  });
};

export const updateMerchantGroup = async (merchantId: number, newGroupId: number | null, currentGroupId?: number | null): Promise<void> => {
  // If merchant is moving from one group to another
  if (currentGroupId && newGroupId && currentGroupId !== newGroupId) {
    await removeMerchantFromGroup(currentGroupId, merchantId);
    await addMerchantToGroup(newGroupId, merchantId);
  }
  // If merchant is being added to a group (and wasn't in any group before)
  else if (!currentGroupId && newGroupId) {
    await addMerchantToGroup(newGroupId, merchantId);
  }
  // If merchant is being removed from a group
  else if (currentGroupId && !newGroupId) {
    await removeMerchantFromGroup(currentGroupId, merchantId);
  }
  // If merchant is staying in the same group or staying without a group, do nothing
};