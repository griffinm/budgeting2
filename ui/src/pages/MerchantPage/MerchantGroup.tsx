import { MerchantLinking } from "@/components/MerchantLinking";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { Merchant } from "@/utils/types";
import { urls } from "@/utils/urls";
import { Button, Input, Textarea, Tooltip } from "@mantine/core";
import { IconCheck, IconInfoCircle, IconPencil, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { updateMerchantGroupDetails } from "@/api/merchant-groups-client";


export function MerchantGroupCard({
  merchant,
  setMerchant,
}: {
  merchant: Merchant;
  setMerchant: (merchant: Merchant) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    if (!merchant.merchantGroup) return;
    setEditName(merchant.merchantGroup.name);
    setEditDescription(merchant.merchantGroup.description || '');
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setIsEditingName(false);
  };

  const saveGroupDetails = async () => {
    if (!merchant.merchantGroup || !editName.trim()) return;

    setIsSaving(true);
    try {
      const updated = await updateMerchantGroupDetails(merchant.merchantGroup.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setMerchant({
        ...merchant,
        merchantGroup: {
          ...merchant.merchantGroup,
          name: updated.name,
          description: updated.description,
        },
      });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Tooltip
          label={
            <div className="max-w-md">
              <p className="mb-2">
                A Merchant Group is a way to combine multiple merchants into one for easier tracking. Sometimes merchant names
                are different across transactions. In order for Budgeting to know these are the same merchants they need to be grouped together.
              </p>
              <p className="mb-2">
                For instance <strong>"Amazon"</strong> and <strong>"Amazon.com, Inc."</strong> are the same merchant.
                Similarly <strong>"Starbucks"</strong> and <strong>"Starbucks Corporation"</strong> are the same merchant.
              </p>
              <p className="mb-2">
                This is why we have Merchant Groups. You can create a group for these merchants and then all the transactions for
                these merchants will be grouped together.
              </p>
              <p>
                You can also add merchants to an existing group.
              </p>
            </div>
          }
          multiline
          withArrow
          position="bottom-start"
          w={400}
        >
          <IconInfoCircle size={20} className="text-gray-500 dark:text-gray-400 cursor-help" />
        </Tooltip>
      </div>

      {/* Merchant Linking Component */}
      <div className="mb-6">
        <MerchantLinking
          merchant={merchant}
          onMerchantUpdate={setMerchant}
        />
      </div>

      {/* Group Information and Merchants */}
      {merchant.merchantGroup && (
        <div>
          <div className="mb-4">
            {isEditingName ? (
              <div className="flex flex-col gap-3 max-w-md">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Group name"
                  size="md"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') cancelEditing();
                  }}
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  size="sm"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') cancelEditing();
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    onClick={saveGroupDetails}
                    loading={isSaving}
                    disabled={!editName.trim()}
                    leftSection={<IconCheck size={14} />}
                  >
                    Save
                  </Button>
                  <Button size="xs" variant="outline" onClick={cancelEditing} leftSection={<IconX size={14} />}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 group">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {merchant.merchantGroup.name}
                  </h3>
                  <button
                    onClick={startEditing}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                      opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Edit group name"
                  >
                    <IconPencil size={16} />
                  </button>
                </div>
                {merchant.merchantGroup.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{merchant.merchantGroup.description}</p>
                )}
              </>
            )}
            {!isEditingName && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {merchant.merchantGroup.merchants?.length || 0} merchants in this group
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Merchants in this group:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {merchant.merchantGroup.merchants?.map((groupMerchant) => (
                <div
                  key={groupMerchant.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    groupMerchant.id === merchant.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-[var(--mantine-color-dark-5)] border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        to={urls.merchant.path(groupMerchant.id)}
                        className={`font-medium ${
                          groupMerchant.id === merchant.id
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {merchantDisplayName(groupMerchant)}
                      </Link>
                      {groupMerchant.id === merchant.merchantGroup?.primaryMerchant?.id && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          Primary Merchant
                        </div>
                      )}
                      {groupMerchant.id === merchant.id && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          Current Merchant
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
