import { MerchantGroup } from "@/utils/types";
import { Button, Input, Modal } from "@mantine/core";
import { useState } from "react";
import classNames from "classnames";
import { createMerchantGroup } from "@/api/merchant-groups-client";

export function MerchantGroupEdit({
  currentValue,
  onCancel,
  onSave,
  allGroups,
  opened,
  onClose,
  onGroupCreated,
  merchantId,
}: {
  currentValue?: MerchantGroup | null;
  onCancel: () => void;
  onSave: (groupId: number | null) => void;
  allGroups: MerchantGroup[];
  opened: boolean;
  onClose: () => void;
  onGroupCreated?: (group: MerchantGroup) => void;
  merchantId: number;
}) {
  const [newValue, setNewValue] = useState<MerchantGroup | null>(currentValue || null);
  const [filter, setFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(newValue?.id || null);
  }

  const handleCreateGroup = async () => {
    if (!filter.trim()) return;
    
    setIsCreating(true);
    try {
      const newGroup = await createMerchantGroup(merchantId, { name: filter.trim() });
      setNewValue(newGroup);
      onGroupCreated?.(newGroup);
      setFilter('');
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Check if any groups match the filter
  const filteredGroups = allGroups?.filter(group => 
    group.name.toLowerCase().includes(filter.toLowerCase())
  ) || [];
  
  const showCreateOption = filter.trim().length > 0 && filteredGroups.length === 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select a merchant group"
      centered
      size="lg"
    >
      <div className="flex flex-col h-[400px] bg-white relative">
        {/* Fixed search box at top */}
        <div className="mb-4 border-b border-gray-200">
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter groups"
          />
        </div>

        {/* Scrollable list in middle */}
        <div className="flex-1 overflow-y-auto border border-gray-300 shadow-md">
          {/* Option to remove from group */}
          <div
            className={classNames('py-2 cursor-pointer hover:bg-gray-100 rounded-md px-1 transition-colors border-b border-gray-300 flex items-center gap-2', {
              'bg-gray-300 font-bold': newValue === null,
            })}
            onClick={() => setNewValue(null)}
          >
            <div className="text-sm text-gray-500">No group</div>
          </div>
          
          {filteredGroups.map(group => (
            <GroupRowItem
              key={group.id}
              group={group}
              onSelect={setNewValue}
              filter={filter}
              selected={newValue?.id === group.id}
            />
          ))}
          
          {showCreateOption && (
            <div className="py-2 px-1 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  No groups found matching "{filter}"
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCreateGroup}
                  loading={isCreating}
                >
                  Create "{filter}"
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="mb-4 bg-white mt-4">
          <form onSubmit={onFormSubmit}>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" color="gray" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="outline" size="xs">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

function GroupRowItem({
  group,
  onSelect,
  filter,
  selected,
}: {
  group: MerchantGroup;
  onSelect: (group: MerchantGroup | null) => void;
  filter: string;
  selected: boolean;
}) {
  const isFiltered = filter.length > 0 && !group.name.toLowerCase().includes(filter.toLowerCase());

  if (isFiltered) {
    return null;
  }

  const classes = classNames('py-2 cursor-pointer hover:bg-gray-100 rounded-md px-1 transition-colors border-b border-gray-300 flex items-center gap-2', {
    'bg-gray-300 font-bold': selected,
  });

  return (
    <div
      className={classes}
      onClick={() => onSelect(group)}
    >
      <div className="flex flex-col">
        <div className="text-sm font-medium">{group.name}</div>
        {group.description && (
          <div className="text-xs text-gray-500">{group.description}</div>
        )}
        <div className="text-xs text-gray-400">
          {group.merchantCount || group.merchants?.length || 0} merchants
        </div>
      </div>
    </div>
  );
}
