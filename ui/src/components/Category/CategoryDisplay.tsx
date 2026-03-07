import { MerchantCategory } from "@/utils/types";
import { useState } from "react";
import { CategoryEdit } from "./CategoryEdit";
import { fullyQualifiedCategoryName } from "@/utils/merchantCategoryUtils";

export function CategoryDisplay({
  category,
  onSave,
  allCategories,
}: {
  category?: MerchantCategory | null;
  onSave: ({ id, useDefaultCategory }: { id: number; useDefaultCategory: boolean }) => void;
  allCategories: MerchantCategory[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div>
      <CategoryEdit
        currentValue={category}
        onCancel={() => setIsEditing(false)}
        onSave={({ id, useDefaultCategory }) => {
          onSave({ id, useDefaultCategory });
          setIsEditing(false);
        }}
        allCategories={allCategories}
        opened={isEditing}
        onClose={() => setIsEditing(false)}
      />
      <Display
        tag={category}
        onEdit={() => setIsEditing(true)}
        allCategories={allCategories}
      />
    </div>
  )
}

export function Display({
  tag,
  onEdit,
  allCategories,
}: {
  tag?: MerchantCategory | null;
  onEdit: () => void;
  allCategories: MerchantCategory[];
}) {

  const renderName = () => {
    if (!tag) {
      return <div className="text-gray-500 dark:text-gray-400 italic">No category</div>
    }

    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-col">
          <div className="text-gray-500 dark:text-gray-400 text-sm">{fullyQualifiedCategoryName(tag, allCategories)}</div>
          <div className="font-bold">{tag.name}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] rounded-md p-1 transition-colors flex" onClick={onEdit}>
      {renderName()}
    </div>
  );
}
