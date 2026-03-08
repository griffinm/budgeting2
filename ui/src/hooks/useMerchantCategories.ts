import { useEffect, useMemo, useState } from "react";
import {
  createMerchantCategory as createMerchantCategoryApi,
  deleteMerchantCategory as deleteMerchantCategoryApi,
  fetchMerchantCategories as fetchMerchantCategoriesApi,
  updateMerchantCategory as updateMerchantCategoryApi,
  CreateMerchantCategoryRequest,
  UpdateMerchantCategoryRequest,
  DeleteMerchantCategoryRequest,
} from "@/api";
import { MerchantCategory } from "@/utils/types";
import { formatMerchantCategoriesAsTree } from "@/utils/merchantCategoryUtils";

export type MerchantCategories = {
  merchantCategories: MerchantCategory[];
  loading: boolean;
  saving: boolean;
  createMerchantCategory: (params: CreateMerchantCategoryRequest) => Promise<void>;
  updateMerchantCategory: (params: UpdateMerchantCategoryRequest) => Promise<void>;
  deleteMerchantCategory: (params: DeleteMerchantCategoryRequest) => Promise<void>;
  rawMerchantCategories: MerchantCategory[];
};

export function useMerchantCategories(): MerchantCategories {
  const [merchantCategoriesRaw, setMerchantCategoriesRaw] = useState<MerchantCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const merchantCategories = useMemo(() => {
    return formatMerchantCategoriesAsTree({ merchantCategories: merchantCategoriesRaw });
  }, [merchantCategoriesRaw]);

  useEffect(() => {
    setLoading(true);
    fetchMerchantCategoriesApi()
      .then(setMerchantCategoriesRaw)
      .finally(() => setLoading(false));
  }, []);

  const createMerchantCategory = async (params: CreateMerchantCategoryRequest) => {
    setSaving(true);
    createMerchantCategoryApi({ data: params })
      .then((newMerchantCategory) => {
        setMerchantCategoriesRaw([...merchantCategoriesRaw, newMerchantCategory]);
      })
      .finally(() => setSaving(false));
  };

  const updateMerchantCategory = async (params: UpdateMerchantCategoryRequest) => {
    setSaving(true);
    updateMerchantCategoryApi({ data: params })
      .then((updatedMerchantCategory) => {
        setMerchantCategoriesRaw(merchantCategoriesRaw.map((merchantCategory) => merchantCategory.id === updatedMerchantCategory.id ? updatedMerchantCategory : merchantCategory));
      })
      .finally(() => setSaving(false));
  };

  const deleteMerchantCategory = async ({ id }: { id: number }) => {
    setSaving(true);
    deleteMerchantCategoryApi({ id })
      .then(() => {
        setMerchantCategoriesRaw(merchantCategoriesRaw.filter((merchantCategory) => merchantCategory.id !== id));
      })
      .finally(() => setSaving(false));
  };

  return {
    createMerchantCategory,
    deleteMerchantCategory,
    loading,
    merchantCategories,
    saving,
    updateMerchantCategory,
    rawMerchantCategories: merchantCategoriesRaw,
  };
}
