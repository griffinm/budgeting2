import { Group, Stack, Text } from "@mantine/core";
import { IconMapPin, IconWorld } from "@tabler/icons-react";
import { Logo } from "@/components/TransactionsTable/Logo";
import { EditableLabel } from "@/components/EditableLabel";
import { MerchantDefaults } from "./MerchantDefaults";
import { Merchant, MerchantCategory, Tag } from "@/utils/types";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { updateMerchant } from "@/api/merchant-client";
import { urls } from "@/utils/urls";

export function HeroSection({
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
  const location = [merchant.city, merchant.state].filter(Boolean).join(", ");

  return (
    <div className="p-4">
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <Logo merchant={merchant} size="xl" />
        <Stack gap="xs" style={{ flex: 1 }}>
          <EditableLabel
            id={merchant.id}
            component="h1"
            additionalClasses="text-2xl font-bold"
            value={merchantDisplayName(merchant)}
            onSave={async (id: number, value: string) => {
              await updateMerchant({ id, value: { customName: value } });
              setMerchant(prev => prev ? { ...prev, customName: value } : null);
            }}
          />

          {(merchant.website || location) && (
            <Group gap="md">
              {merchant.website && (
                <Group gap={4}>
                  <IconWorld size={14} color="var(--mantine-color-dimmed)" />
                  <Text size="sm" c="dimmed">{merchant.website}</Text>
                </Group>
              )}
              {location && (
                <Group gap={4}>
                  <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
                  <Text size="sm" c="dimmed">{location}</Text>
                </Group>
              )}
            </Group>
          )}

          <div className="border-t border-gray-200 pt-3 mt-1">
            <MerchantDefaults
              merchant={merchant}
              setMerchant={setMerchant}
              allCategories={allCategories}
              allTags={allTags}
              onCreateTag={onCreateTag}
            />
          </div>
        </Stack>
      </Group>
    </div>
  );
}
