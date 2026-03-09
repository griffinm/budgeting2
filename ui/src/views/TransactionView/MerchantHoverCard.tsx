import { useState, useRef, useEffect } from "react";
import {
  Badge,
  Button,
  Divider,
  HoverCard,
  Modal,
  Popover,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconChevronDown,
  IconExternalLink,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Merchant, Tag } from "@/utils/types";
import { updateMerchant } from "@/api/merchant-client";
import { createTag } from "@/api/tags-client";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";

interface MerchantHoverCardProps {
  merchant: Merchant;
  allTags: Tag[];
  onMerchantUpdated: (merchant: Merchant) => void;
  onTagCreated: (tag: Tag) => void;
  children: React.ReactNode;
}

export function MerchantHoverCard({
  merchant,
  allTags,
  onMerchantUpdated,
  onTagCreated,
  children,
}: MerchantHoverCardProps) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [clickOpened, setClickOpened] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    pendingApply: (() => Promise<Merchant>) | null;
    pendingSkip: (() => Promise<Merchant>) | null;
  }>({ open: false, pendingApply: null, pendingSkip: null });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (popoverOpened) {
      setFilter("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [popoverOpened]);

  const addedTagIds = new Set(merchant.defaultTags.map((t) => t.id));

  const availableTags = allTags.filter(
    (tag) =>
      !addedTagIds.has(tag.id) &&
      (filter.length === 0 ||
        tag.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const showCreateOption =
    filter.trim().length > 0 &&
    !allTags.some(
      (tag) => tag.name.toLowerCase() === filter.trim().toLowerCase()
    );

  const handleAddTag = (tagId: number) => {
    setPopoverOpened(false);
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
    const newTagIds = merchant.defaultTags
      .filter((t) => t.id !== tagId)
      .map((t) => t.id);
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
    setPopoverOpened(false);
    const newTag = await createTag({ name });
    onTagCreated(newTag);
    handleAddTag(newTag.id);
  };

  const handleConfirm = async (applyToExisting: boolean) => {
    const fn = applyToExisting
      ? confirmModal.pendingApply
      : confirmModal.pendingSkip;
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
  const location = [merchant.city, merchant.state].filter(Boolean).join(", ");

  // Keep HoverCard open when inner popover is open or click-toggled
  const forceOpen = popoverOpened || clickOpened;

  return (
    <>
      <HoverCard
        width={320}
        openDelay={200}
        closeDelay={400}
        withArrow
        shadow="md"
        position="bottom-start"
        {...(forceOpen ? { opened: true } : {})}
      >
        <HoverCard.Target>
          <div className="flex items-center gap-2">
            {children}
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 -ml-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setClickOpened((o) => !o);
              }}
              aria-label="Merchant info"
            >
              <IconChevronDown size={16} />
            </button>
          </div>
        </HoverCard.Target>

        <HoverCard.Dropdown>
          {/* Merchant metadata */}
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="flex items-center justify-between gap-2">
              {merchant.defaultMerchantTag && (
                <Badge variant="light" size="sm">
                  {merchant.defaultMerchantTag.name}
                </Badge>
              )}
              {merchant.merchantGroup && (
                <Link
                  to={urls.merchant.path(
                    merchant.merchantGroup.primaryMerchant.id
                  )}
                >
                  <Text size="xs" c="dimmed" className="hover:underline">
                    {merchant.merchantGroup.name} &rsaquo;
                  </Text>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {location && <span>{location}</span>}
              {location && merchant.website && <span>&middot;</span>}
              {merchant.website && (
                <a
                  href={
                    merchant.website.startsWith("http")
                      ? merchant.website
                      : `https://${merchant.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 hover:underline text-blue-600 dark:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {merchant.website.replace(/^https?:\/\//, "")}
                  <IconExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          <Divider my="xs" />

          {/* Default tags section */}
          <div>
            <Text
              size="xs"
              c="dimmed"
              tt="uppercase"
              fw={600}
              className="tracking-wide mb-1.5"
            >
              Default Tags
            </Text>
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
                opened={popoverOpened}
                onClose={() => setPopoverOpened(false)}
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
                    onClick={() => setPopoverOpened((o) => !o)}
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
                          Create &ldquo;{filter.trim()}&rdquo;
                        </div>
                      )}
                      {availableTags.length === 0 && !showCreateOption && (
                        <div className="text-gray-400 dark:text-gray-500 text-xs px-1 py-2">
                          No tags found
                        </div>
                      )}
                    </div>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
            <Text size="xs" c="dimmed" mt={6}>
              Auto-applied to new transactions
            </Text>
          </div>
        </HoverCard.Dropdown>
      </HoverCard>

      <Modal
        opened={confirmModal.open}
        onClose={() =>
          setConfirmModal({ open: false, pendingApply: null, pendingSkip: null })
        }
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
