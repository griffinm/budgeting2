import { useState, useRef, useEffect } from "react";
import { Badge, Popover, TextInput } from "@mantine/core";
import { IconX, IconPlus } from "@tabler/icons-react";
import { Tag, Transaction } from "@/utils/types";

export function TransactionTags({
  transaction,
  allTags,
  onAdd,
  onRemove,
  onCreateAndAdd,
}: {
  transaction: Transaction;
  allTags: Tag[];
  onAdd: (transactionId: number, tagId: number) => void;
  onRemove: (transactionId: number, transactionTagId: number) => void;
  onCreateAndAdd: (transactionId: number, name: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      setFilter("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [opened]);

  const addedTagIds = new Set(transaction.transactionTags.map((tt) => tt.tagId));

  const availableTags = allTags.filter(
    (tag) =>
      !addedTagIds.has(tag.id) &&
      (filter.length === 0 || tag.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const showCreateOption =
    filter.trim().length > 0 &&
    !allTags.some((tag) => tag.name.toLowerCase() === filter.trim().toLowerCase());

  const handleAdd = (tagId: number) => {
    onAdd(transaction.id, tagId);
    setOpened(false);
  };

  const handleCreate = () => {
    onCreateAndAdd(transaction.id, filter.trim());
    setOpened(false);
  };

  const handleRemove = (e: React.MouseEvent, transactionTagId: number) => {
    e.stopPropagation();
    onRemove(transaction.id, transactionTagId);
  };

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom-start"
      withArrow
      shadow="md"
      width={220}
    >
      <Popover.Target>
        <div
          className="flex flex-wrap gap-1 cursor-pointer min-h-[28px] items-center rounded-md p-1 hover:bg-gray-100 transition-colors"
          onClick={() => setOpened((o) => !o)}
        >
          {transaction.transactionTags.length === 0 ? (
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <IconPlus size={12} />
              Add tag
            </span>
          ) : (
            <>
              {transaction.transactionTags.map((tt) => (
                <Badge
                  key={tt.id}
                  variant="filled"
                  size="sm"
                  style={{ backgroundColor: `#${tt.tag.color}` }}
                  rightSection={
                    <IconX
                      size={10}
                      className="cursor-pointer"
                      onClick={(e) => handleRemove(e, tt.id)}
                    />
                  }
                >
                  {tt.tag.name}
                </Badge>
              ))}
              <IconPlus size={12} className="text-gray-400" />
            </>
          )}
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="flex flex-col gap-2">
          <TextInput
            ref={inputRef}
            size="xs"
            placeholder="Search tags…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="flex flex-col max-h-[200px] overflow-y-auto">
            {availableTags.map((tag) => (
              <div
                key={tag.id}
                className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleAdd(tag.id)}
              >
                {tag.name}
              </div>
            ))}
            {showCreateOption && (
              <div
                className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors text-blue-600 flex items-center gap-1"
                onClick={handleCreate}
              >
                <IconPlus size={12} />
                Create "{filter.trim()}"
              </div>
            )}
            {availableTags.length === 0 && !showCreateOption && (
              <div className="text-gray-400 text-xs px-1 py-2">No tags found</div>
            )}
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
