import { useEffect, useState } from "react";
import { Button, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { MerchantTag } from "@/utils/types";
import { CreateMerchantTagRequest, UpdateMerchantTagRequest } from "@/api";
import { Errors } from "@/components/Errors/Errors";

function getDescendantIds(tag: MerchantTag): number[] {
  const ids: number[] = [tag.id];
  for (const child of tag.children) {
    ids.push(...getDescendantIds(child));
  }
  return ids;
}

export function EditCategoryModal({
  merchantTag,
  allMerchantTags,
  isOpen,
  onClose,
  onSave,
  onCreate,
  isSaving,
  errors,
}: {
  merchantTag?: MerchantTag;
  allMerchantTags: MerchantTag[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: UpdateMerchantTagRequest) => void;
  onCreate: (params: CreateMerchantTagRequest) => void;
  isSaving: boolean;
  errors: string[];
}) {
  const isEditing = !!merchantTag;
  const [name, setName] = useState(merchantTag?.name || "");
  const [budget, setBudget] = useState<number | string>(merchantTag?.targetBudget || "");
  const [parentId, setParentId] = useState<string | null>(
    merchantTag?.parentMerchantTagId?.toString() || null
  );

  useEffect(() => {
    if (isOpen) {
      setName(merchantTag?.name || "");
      setBudget(merchantTag?.targetBudget || "");
      setParentId(merchantTag?.parentMerchantTagId?.toString() || null);
    }
  }, [isOpen, merchantTag]);

  const excludedIds = merchantTag ? getDescendantIds(merchantTag) : [];
  const parentOptions = allMerchantTags
    .filter((t) => !excludedIds.includes(t.id))
    .map((t) => ({
      value: t.id.toString(),
      label: t.name,
    }));

  const handleSave = () => {
    const data = {
      name,
      targetBudget: budget === "" ? null : Number(budget),
      parentMerchantTagId: parentId ? Number(parentId) : null,
    };
    if (isEditing) {
      onSave({ id: merchantTag!.id, data });
    } else {
      onCreate(data);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${merchantTag?.name}` : "New Category"}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <Errors errors={errors} />
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <NumberInput
          label="Budget"
          value={budget}
          onChange={(val) => setBudget(val)}
          prefix="$"
          thousandSeparator=","
          allowNegative={false}
          decimalScale={2}
        />
        <Select
          label="Parent Category"
          data={parentOptions}
          value={parentId}
          onChange={setParentId}
          clearable
          placeholder="None (top-level)"
          searchable
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="subtle"
            leftSection={<IconX size={16} />}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            leftSection={<IconCheck size={16} />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!name}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
