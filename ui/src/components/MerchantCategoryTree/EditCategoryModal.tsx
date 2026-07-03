import { useEffect, useState } from "react";
import { Button, Modal, NumberInput, SegmentedControl, Select, Text, TextInput } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { MerchantCategory } from "@/utils/types";
import { CreateMerchantCategoryRequest, UpdateMerchantCategoryRequest } from "@/api";
import { Errors } from "@/components/Errors/Errors";
import { getDescendantIds } from "@/utils/merchantCategoryUtils";

export function EditCategoryModal({
  merchantCategory,
  allMerchantCategories,
  isOpen,
  onClose,
  onSave,
  onCreate,
  isSaving,
  errors,
}: {
  merchantCategory?: MerchantCategory;
  allMerchantCategories: MerchantCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: UpdateMerchantCategoryRequest) => void;
  onCreate: (params: CreateMerchantCategoryRequest) => void;
  isSaving: boolean;
  errors: string[];
}) {
  const isEditing = !!merchantCategory;
  const [name, setName] = useState(merchantCategory?.name || "");
  const [budget, setBudget] = useState<number | string>(merchantCategory?.targetBudget || "");
  const [parentId, setParentId] = useState<string | null>(
    merchantCategory?.parentMerchantTagId?.toString() || null
  );
  const [tagType, setTagType] = useState<'expense' | 'income'>(
    merchantCategory?.tagType || 'expense'
  );

  useEffect(() => {
    if (isOpen) {
      setName(merchantCategory?.name || "");
      setBudget(merchantCategory?.targetBudget || "");
      setParentId(merchantCategory?.parentMerchantTagId?.toString() || null);
      setTagType(merchantCategory?.tagType || 'expense');
    }
  }, [isOpen, merchantCategory]);

  const excludedIds = merchantCategory ? getDescendantIds(merchantCategory) : [];
  const parentOptions = allMerchantCategories
    .filter((t) => !excludedIds.includes(t.id))
    .map((t) => ({
      value: t.id.toString(),
      label: t.name,
    }));

  // Children always inherit the root's type, so the toggle only applies to
  // top-level categories; nested ones show the parent's type
  const effectiveType: 'expense' | 'income' = parentId
    ? allMerchantCategories.find((t) => t.id === Number(parentId))?.tagType ?? 'expense'
    : tagType;

  const handleSave = () => {
    const data = {
      name,
      targetBudget: budget === "" ? null : Number(budget),
      parentMerchantTagId: parentId ? Number(parentId) : null,
      tagType,
    };
    if (isEditing) {
      onSave({ id: merchantCategory!.id, data });
    } else {
      onCreate(data);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${merchantCategory?.name}` : "New Category"}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <Errors errors={errors} />
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {parentId === null ? (
          <div>
            <Text size="sm" fw={500} mb={4}>
              Type
            </Text>
            <SegmentedControl
              fullWidth
              value={tagType}
              onChange={(value) => setTagType(value as 'expense' | 'income')}
              data={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
          </div>
        ) : (
          <Text size="xs" c="dimmed">
            Type is inherited from the parent category ({effectiveType})
          </Text>
        )}
        <NumberInput
          label={effectiveType === 'income' ? 'Expected monthly income' : 'Budget'}
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
