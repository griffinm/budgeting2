import { MerchantCategory } from "@/utils/types";
import { useState } from "react";
import { CategoryEdit } from "./CategoryEdit";
import { categoryParentPath } from "@/utils/merchantCategoryUtils";

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

    const parentPath = categoryParentPath(tag, allCategories);

    return (
      <div className="flex flex-col min-w-0">
        {parentPath && (
          <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{parentPath}</div>
        )}
        <div className="font-bold truncate">{tag.name}</div>
      </div>
    )
  }

  return (
    <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] rounded-md p-1 transition-colors flex" onClick={onEdit}>
      {renderName()}
    </div>
  );
}
