import { UpdateMerchantTagRequest } from "@/api";
import { MerchantTag } from "@/utils/types";
import { Button, TextInput } from "@mantine/core";
import { IconCheck, IconCurrencyDollar, IconX } from "@tabler/icons-react";
import { useState } from "react";

export function EditBudget({
  merchantTag,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  merchantTag: MerchantTag;
  onSave: (params: UpdateMerchantTagRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
  error?: string;
}) {
  const [newBudget, setNewBudget] = useState(merchantTag.targetBudget || 0);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ id: merchantTag.id, data: { targetBudget: newBudget } });
  }

  return (
    <div>
      <form onSubmit={handleSave}>
        <div className="flex flex-col sm:flex-row gap-2 border border-gray-200 rounded-md p-2 bg-neutral-100">
          <TextInput
            size="xs"
            value={newBudget}
            onChange={(e) => setNewBudget(Number(e.target.value))}
            leftSection={<IconCurrencyDollar size={16} />}
            placeholder="New budget"
            error={error}
            autoFocus
          />
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="subtle"
              size="xs"
              leftSection={<IconX size={16} />}
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              size="xs"
              leftSection={<IconCheck size={16} />}
              loading={isSaving}
            >
              Save
            </Button>
          </div>

        </div>
      </form>
    </div>
  )
}
