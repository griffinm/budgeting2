import { MerchantCategory } from "@/utils/types";
import { Button, Checkbox, Input, Modal } from "@mantine/core";
import { useState } from "react";
import { fullyQualifiedCategoryName } from "@/utils/merchantCategoryUtils";
import classNames from "classnames";

export function CategoryEdit({
  currentValue,
  onCancel,
  onSave,
  allCategories,
  opened,
  onClose,
}: {
  currentValue?: MerchantCategory | null;
  onCancel: () => void;
  onSave: ({ id, useDefaultCategory }: { id: number; useDefaultCategory: boolean }) => void;
  allCategories: MerchantCategory[];
  opened: boolean;
  onClose: () => void;
}) {
  const [newValue, setNewValue] = useState<MerchantCategory | null>(currentValue || null);
  const [filter, setFilter] = useState('');
  const [useDefaultCategory, setUseDefaultCategory] = useState(false);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newValue) {
      onSave({ id: newValue.id, useDefaultCategory });
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select a category"
      centered
      size="lg"
    >
      <div className="flex flex-col h-[400px] bg-white dark:bg-[var(--mantine-color-dark-6)] relative">
        {/* Fixed search box at top */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter categories"
          />
        </div>

        {/* Scrollable list in middle */}
        <div className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 shadow-md">
          {allCategories.map(category => (
            <RowItem
              key={category.id}
              item={category}
              allCategories={allCategories}
              onSelect={newValue => setNewValue(newValue)}
              filter={filter}
              selected={newValue?.id === category.id}
            />
          ))}
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="mb-4 bg-white dark:bg-[var(--mantine-color-dark-6)] mt-4">
          <form onSubmit={onFormSubmit}>
            <div className="flex justify-between">
              <Checkbox
                label="Make default for merchant"
                checked={useDefaultCategory}
                onChange={e => setUseDefaultCategory(e.target.checked)}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="xs" color="gray" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="outline" size="xs">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

function RowItem({
  item,
  allCategories,
  onSelect,
  filter,
  selected,
}: {
  item: MerchantCategory;
  allCategories: MerchantCategory[];
  onSelect: (item: MerchantCategory) => void;
  filter: string;
  selected: boolean;
}) {
  const isFiltered = filter.length > 0 && !fullyQualifiedCategoryName(item, allCategories).toLowerCase().includes(filter.toLowerCase());

  if (isFiltered) {
    return null;
  }

  const classes = classNames('py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] rounded-md px-1 transition-colors border-b border-gray-300 dark:border-gray-600 flex items-center gap-2', {
    'bg-gray-300 font-bold': selected,
  });

  return (
    <div
      className={classes}
      onClick={() => onSelect(item)}
    >
      <div className='h-full w-[20px] rounded-md' style={{ backgroundColor: `#${item.color}` }}>
        &nbsp;
      </div>
      <div>
        {fullyQualifiedCategoryName(item, allCategories)}
      </div>
    </div>
  )
}
