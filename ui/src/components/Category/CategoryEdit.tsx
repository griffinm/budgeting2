import { MerchantTag } from "@/utils/types";
import { Button, Checkbox, Input } from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { fullyQualifiedTagName } from "@/utils/merchantTagUtils";
import classNames from "classnames";

export function CategoryEdit({
  currentValue,
  onCancel,
  onSave,
  allCategories,
}: {
  currentValue?: MerchantTag | null;
  onCancel: () => void;
  onSave: ({ id, useDefaultCategory }: { id: number; useDefaultCategory: boolean }) => void;
  allCategories: MerchantTag[];
}) {
  const [newValue, setNewValue] = useState<MerchantTag | null>(currentValue || null);
  const [filter, setFilter] = useState('');
  const divRef = useRef<HTMLDivElement>(null);
  const [useDefaultCategory, setUseDefaultCategory] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newValue) {
      onSave({ id: newValue.id, useDefaultCategory });
    }
  }

  return (
    <div className="relative">
      <form className="flex flex-col gap-2" onSubmit={onFormSubmit}>
        <div ref={divRef} className="absolute top-0 right-0 w-[300px] h-[350px] z-10 border border-gray-200 rounded-md">
          <div className="flex flex-col gap-2 h-full bg-gray-100 p-2 rounded-md drop-shadow-lg">
            <div className="border-b border-gray-200 pb-2 flex justify-between">
              <div className="font-bold">
                Select a new category
              </div>
              <div className="cursor-pointer hover:bg-gray-200 rounded-md px-2" onClick={onCancel}>
                X
              </div>
            </div>
            <Input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter categories"
            />
            <div className="flex-1 overflow-y-auto bg-white p-3 rounded-md">
              <div className="h-full">
                <div className="flex flex-col gap-2"></div>
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
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                label="Make default for merchant"
                checked={useDefaultCategory}
                onChange={e => setUseDefaultCategory(e.target.checked)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" color="gray" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="outline" size="xs">
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function RowItem({
  item,
  allCategories,
  onSelect,
  filter,
  selected,
}: {
  item: MerchantTag;
  allCategories: MerchantTag[];
  onSelect: (item: MerchantTag) => void;
  filter: string;
  selected: boolean;
}) {
  const isFiltered = filter.length > 0 && !fullyQualifiedTagName(item, allCategories).toLowerCase().includes(filter.toLowerCase());

  if (isFiltered) {
    return null;
  }

  const classes = classNames('py-2 cursor-pointer hover:bg-gray-100 rounded-md px-1 transition-colors border-b border-gray-300 flex items-center gap-2', {
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
        {fullyQualifiedTagName(item, allCategories)}
      </div>
    </div>
  )
}
