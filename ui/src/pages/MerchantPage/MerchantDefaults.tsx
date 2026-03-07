import { useState, useRef, useEffect } from "react";
import { Badge, Button, Card, Modal, Popover, TextInput } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { Merchant, MerchantCategory, Tag } from "@/utils/types";
import { updateMerchant } from "@/api/merchant-client";
import { Display } from "@/components/Category/CategoryDisplay";
import { CategoryEdit } from "@/components/Category/CategoryEdit";

export function MerchantDefaults({
  merchant,
  setMerchant,
  allCategories,
  allTags,
  onCreateTag,
}: {
  merchant: Merchant;
  setMerchant: React.Dispatch<React.SetStateAction<Merchant | null>>;
  allCategories: MerchantCategory[];
  allTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag>;
}) {
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    pendingUpdate: (() => Promise<Merchant>) | null;
  }>({ open: false, pendingUpdate: null });
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (applyToExisting: boolean) => {
    if (!confirmModal.pendingUpdate) return;
    setSaving(true);
    try {
      // Re-run with the correct applyToExisting value
      const result = applyToExisting
        ? await confirmModal.pendingUpdate()
        : await pendingNoApplyFn.current!();
      setMerchant(result);
    } finally {
      setSaving(false);
      setConfirmModal({ open: false, pendingUpdate: null });
      pendingNoApplyFn.current = null;
    }
  };

  const pendingNoApplyFn = useRef<(() => Promise<Merchant>) | null>(null);

  const handleCategoryChange = (categoryId: number | null) => {
    setCategoryEditOpen(false);

    const doUpdate = (applyToExisting: boolean) =>
      updateMerchant({
        id: merchant.id,
        value: { defaultMerchantTagId: categoryId },
        applyToExisting,
      });

    pendingNoApplyFn.current = () => doUpdate(false);
    setConfirmModal({
      open: true,
      pendingUpdate: () => doUpdate(true),
    });
  };

  const handleClearCategory = () => {
    handleCategoryChange(null);
  };

  const handleAddTag = (tagId: number) => {
    const newTagIds = [...merchant.defaultTags.map((t) => t.id), tagId];

    const doUpdate = (applyToExisting: boolean) =>
      updateMerchant({
        id: merchant.id,
        value: {},
        defaultTagIds: newTagIds,
        applyToExisting,
      });

    pendingNoApplyFn.current = () => doUpdate(false);
    setConfirmModal({
      open: true,
      pendingUpdate: () => doUpdate(true),
    });
  };

  const handleRemoveTag = (tagId: number) => {
    const newTagIds = merchant.defaultTags.filter((t) => t.id !== tagId).map((t) => t.id);

    const doUpdate = (applyToExisting: boolean) =>
      updateMerchant({
        id: merchant.id,
        value: {},
        defaultTagIds: newTagIds,
        applyToExisting: false, // removing a default tag never removes from existing transactions
      });

    // No confirmation needed for removal - just save
    setSaving(true);
    doUpdate(false).then(setMerchant).finally(() => setSaving(false));
  };

  const handleCreateAndAddTag = async (name: string) => {
    const newTag = await onCreateTag(name);
    handleAddTag(newTag.id);
  };

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold mb-4">Defaults</h2>
        <div className="flex flex-col gap-4">
          <DefaultCategory
            merchant={merchant}
            allCategories={allCategories}
            categoryEditOpen={categoryEditOpen}
            setCategoryEditOpen={setCategoryEditOpen}
            onCategoryChange={handleCategoryChange}
            onClear={handleClearCategory}
          />
          <DefaultTags
            merchant={merchant}
            allTags={allTags}
            onAdd={handleAddTag}
            onRemove={handleRemoveTag}
            onCreateAndAdd={handleCreateAndAddTag}
          />
        </div>
      </Card>

      <Modal
        opened={confirmModal.open}
        onClose={() => {
          setConfirmModal({ open: false, pendingUpdate: null });
          pendingNoApplyFn.current = null;
        }}
        title="Apply to existing transactions?"
        centered
      >
        <p className="mb-4 text-sm text-gray-600">
          Would you like to apply this change to all existing transactions for this {merchant.merchantGroup ? 'merchant group' : 'merchant'}?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            color="gray"
            onClick={() => handleConfirm(false)}
            loading={saving}
          >
            No, only new transactions
          </Button>
          <Button onClick={() => handleConfirm(true)} loading={saving}>
            Yes, apply to all
          </Button>
        </div>
      </Modal>
    </>
  );
}

function DefaultCategory({
  merchant,
  allCategories,
  categoryEditOpen,
  setCategoryEditOpen,
  onCategoryChange,
  onClear,
}: {
  merchant: Merchant;
  allCategories: MerchantCategory[];
  categoryEditOpen: boolean;
  setCategoryEditOpen: (open: boolean) => void;
  onCategoryChange: (id: number | null) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-500 mb-1">Default Category</div>
      <div className="flex items-center gap-2">
        <Display
          tag={merchant.defaultMerchantTag}
          onEdit={() => setCategoryEditOpen(true)}
          allCategories={allCategories}
        />
        {merchant.defaultMerchantTag && (
          <Button variant="subtle" size="compact-xs" color="gray" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      <CategoryEdit
        currentValue={merchant.defaultMerchantTag}
        onCancel={() => setCategoryEditOpen(false)}
        onSave={({ id }) => onCategoryChange(id)}
        allCategories={allCategories}
        opened={categoryEditOpen}
        onClose={() => setCategoryEditOpen(false)}
      />
    </div>
  );
}

function DefaultTags({
  merchant,
  allTags,
  onAdd,
  onRemove,
  onCreateAndAdd,
}: {
  merchant: Merchant;
  allTags: Tag[];
  onAdd: (tagId: number) => void;
  onRemove: (tagId: number) => void;
  onCreateAndAdd: (name: string) => void;
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

  const addedTagIds = new Set(merchant.defaultTags.map((t) => t.id));

  const availableTags = allTags.filter(
    (tag) =>
      !addedTagIds.has(tag.id) &&
      (filter.length === 0 || tag.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const showCreateOption =
    filter.trim().length > 0 &&
    !allTags.some((tag) => tag.name.toLowerCase() === filter.trim().toLowerCase());

  return (
    <div>
      <div className="text-sm font-medium text-gray-500 mb-1">Default Tags</div>
      <div className="flex flex-wrap gap-1 items-center">
        {merchant.defaultTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="filled"
            size="sm"
            style={{ backgroundColor: `#${tag.color}` }}
            rightSection={
              <IconX
                size={10}
                className="cursor-pointer"
                onClick={() => onRemove(tag.id)}
              />
            }
          >
            {tag.name}
          </Badge>
        ))}
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          position="bottom-start"
          withArrow
          shadow="md"
          width={220}
        >
          <Popover.Target>
            <Button
              variant="subtle"
              size="compact-xs"
              color="gray"
              leftSection={<IconPlus size={12} />}
              onClick={() => setOpened((o) => !o)}
            >
              Add
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="flex flex-col gap-2">
              <TextInput
                ref={inputRef}
                size="xs"
                placeholder="Search tags..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="flex flex-col max-h-[200px] overflow-y-auto">
                {availableTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      onAdd(tag.id);
                      setOpened(false);
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
                {showCreateOption && (
                  <div
                    className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors text-blue-600 flex items-center gap-1"
                    onClick={() => {
                      onCreateAndAdd(filter.trim());
                      setOpened(false);
                    }}
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
      </div>
    </div>
  );
}
