import { ActionIcon, Group, Menu, Tooltip } from "@mantine/core";
import {
  IconDotsVertical,
  IconPencil,
  IconReceipt,
  IconTrash,
} from "@tabler/icons-react";
import { MerchantCategory } from "@/utils/types";

export function RowActions({
  category,
  onEdit,
  onViewTransactions,
  onDelete,
}: {
  category: MerchantCategory;
  onEdit: (category: MerchantCategory) => void;
  onViewTransactions: (category: MerchantCategory) => void;
  onDelete: (category: MerchantCategory) => void;
}) {
  const items = [
    { label: "Edit", icon: IconPencil, action: onEdit, color: "gray" },
    { label: "View transactions", icon: IconReceipt, action: onViewTransactions, color: "gray" },
    { label: "Delete", icon: IconTrash, action: onDelete, color: "red" },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
      <div className="hidden sm:block">
        <Group gap={2} wrap="nowrap">
          {items.map(({ label, icon: Icon, action, color }) => (
            <Tooltip key={label} label={label} withArrow openDelay={300}>
              <ActionIcon
                variant="subtle"
                color={color}
                size="md"
                aria-label={label}
                onClick={() => action(category)}
              >
                <Icon size={16} />
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
      </div>
      <div className="sm:hidden">
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="Actions">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {items.map(({ label, icon: Icon, action, color }) => (
              <Menu.Item
                key={label}
                leftSection={<Icon size={16} />}
                color={color === "red" ? "red" : undefined}
                onClick={() => action(category)}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
