import { useState, useRef, useEffect } from "react";
import { Badge, Button, Modal, Popover, TextInput } from "@mantine/core";
import { IconPlus, IconX, IconTag } from "@tabler/icons-react";
import { Merchant, Tag } from "@/utils/types";
import { updateMerchant } from "@/api/merchant-client";
import { createTag } from "@/api/tags-client";
import { merchantDisplayName } from "@/utils/merchantsUtils";

interface MerchantDefaultTagsCardProps {
  merchant: Merchant;
  allTags: Tag[];
  onMerchantUpdated: (merchant: Merchant) => void;
  onTagCreated: (tag: Tag) => void;
}

export function MerchantDefaultTagsCard({
  merchant,
  allTags,
  onMerchantUpdated,
  onTagCreated,
}: MerchantDefaultTagsCardProps) {
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    pendingApply: (() => Promise<Merchant>) | null;
    pendingSkip: (() => Promise<Merchant>) | null;
  }>({ open: false, pendingApply: null, pendingSkip: null });
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

  const handleAddTag = (tagId: number) => {
    setOpened(false);
    const newTagIds = [...merchant.defaultTags.map((t) => t.id), tagId];

    const doUpdate = (applyToExisting: boolean) =>
      updateMerchant({
        id: merchant.id,
        value: {},
        defaultTagIds: newTagIds,
        applyToExisting,
      });

    setConfirmModal({
      open: true,
      pendingApply: () => doUpdate(true),
      pendingSkip: () => doUpdate(false),
    });
  };

  const handleRemoveTag = (tagId: number) => {
    const newTagIds = merchant.defaultTags.filter((t) => t.id !== tagId).map((t) => t.id);
    setSaving(true);
    updateMerchant({
      id: merchant.id,
      value: {},
      defaultTagIds: newTagIds,
      applyToExisting: false,
    })
      .then(onMerchantUpdated)
      .finally(() => setSaving(false));
  };

  const handleCreateAndAdd = async (name: string) => {
    setOpened(false);
    const newTag = await createTag({ name });
    onTagCreated(newTag);
    handleAddTag(newTag.id);
  };

  const handleConfirm = async (applyToExisting: boolean) => {
    const fn = applyToExisting ? confirmModal.pendingApply : confirmModal.pendingSkip;
    if (!fn) return;
    setSaving(true);
    try {
      const result = await fn();
      onMerchantUpdated(result);
    } finally {
      setSaving(false);
      setConfirmModal({ open: false, pendingApply: null, pendingSkip: null });
    }
  };

  const displayName = merchantDisplayName(merchant);

  return (
    <>
      <div className="flex items-start gap-3">
        <IconTag size={16} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
            Default tags for {displayName}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
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
                    onClick={() => handleRemoveTag(tag.id)}
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
                  loading={saving}
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
                        className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] transition-colors"
                        onClick={() => handleAddTag(tag.id)}
                      >
                        {tag.name}
                      </div>
                    ))}
                    {showCreateOption && (
                      <div
                        className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] transition-colors text-blue-600 dark:text-blue-400 flex items-center gap-1"
                        onClick={() => handleCreateAndAdd(filter.trim())}
                      >
                        <IconPlus size={12} />
                        Create "{filter.trim()}"
                      </div>
                    )}
                    {availableTags.length === 0 && !showCreateOption && (
                      <div className="text-gray-400 dark:text-gray-500 text-xs px-1 py-2">No tags found</div>
                    )}
                  </div>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
          {merchant.defaultTags.length === 0 && !opened && (
            <div className="text-xs text-gray-400 mt-1">
              Tags added here will auto-apply to new transactions from this merchant
            </div>
          )}
        </div>
      </div>

      <Modal
        opened={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, pendingApply: null, pendingSkip: null })}
        title="Apply to existing transactions?"
        centered
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Apply this tag to all existing transactions for {displayName}
          {merchant.merchantGroup ? " (and its merchant group)" : ""}?
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
