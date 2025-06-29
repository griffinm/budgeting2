import { useEffect, useMemo, useState } from "react";
import { 
  createMerchantTag as createMerchantTagApi,
  deleteMerchantTag as deleteMerchantTagApi,
  fetchMerchantTags as fetchMerchantTagsApi,
  updateMerchantTag as updateMerchantTagApi,
  CreateMerchantTagRequest,
  UpdateMerchantTagRequest,
  DeleteMerchantTagRequest,
} from "@/api";
import { MerchantTag } from "@/utils/types";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";

export type MerchantTags = {
  merchantTags: MerchantTag[];
  loading: boolean;
  saving: boolean;
  createMerchantTag: (params: CreateMerchantTagRequest) => Promise<void>;
  updateMerchantTag: (params: UpdateMerchantTagRequest) => Promise<void>;
  deleteMerchantTag: (params: DeleteMerchantTagRequest) => Promise<void>;
};

export function useMerchantTags(): MerchantTags {
  const [merchantTagsRaw, setMerchantTagsRaw] = useState<MerchantTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const merchantTags = useMemo(() => {
    return formatMerchantTagsAsTree({ merchantTags: merchantTagsRaw });
  }, [merchantTagsRaw]);

  useEffect(() => {
    setLoading(true);
    fetchMerchantTagsApi()
      .then(setMerchantTagsRaw)
      .finally(() => setLoading(false));
  }, []);

  const createMerchantTag = async (params: CreateMerchantTagRequest) => {
    setSaving(true);
    createMerchantTagApi({ data: params })
      .then((newMerchantTag) => {
        setMerchantTagsRaw([...merchantTagsRaw, newMerchantTag]);
      })
      .finally(() => setSaving(false));
  };

  const updateMerchantTag = async (params: UpdateMerchantTagRequest) => {
    setSaving(true);
    updateMerchantTagApi({ data: params })
      .then((updatedMerchantTag) => {
        setMerchantTagsRaw(merchantTagsRaw.map((merchantTag) => merchantTag.id === updatedMerchantTag.id ? updatedMerchantTag : merchantTag));
      })
      .finally(() => setSaving(false));
  };

  const deleteMerchantTag = async ({ id }: { id: number }) => {
    setSaving(true);
    deleteMerchantTagApi({ id })
      .then(() => {
        setMerchantTagsRaw(merchantTagsRaw.filter((merchantTag) => merchantTag.id !== id));
      })
      .finally(() => setSaving(false));
  };

  return {
    createMerchantTag,
    deleteMerchantTag,
    loading,
    merchantTags,
    saving,
    updateMerchantTag,
  };
}
