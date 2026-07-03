import { useState } from "react";
import { ActionIcon, Button, NumberInput, Tooltip } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { MerchantCategory } from "@/utils/types";
import { Budget } from "./Budget";

// Inline editor for leaf-category budgets. Budgets are stored monthly on the
// backend, so the input always edits the monthly amount even when the page is
// showing a multi-month range.
export function InlineBudget({
  category,
  monthsMultiplier,
  onSave,
}: {
  category: MerchantCategory;
  monthsMultiplier: number;
  onSave: (targetBudget: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number | string>("");

  const hasBudget = Number(category.targetBudget) > 0;

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(category.targetBudget || "");
    setEditing(true);
  };

  const commit = () => {
    if (!editing) return;
    setEditing(false);
    const newBudget = value === "" ? null : Number(value);
    if (newBudget !== (category.targetBudget ?? null)) {
      onSave(newBudget);
    }
  };

  if (editing) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="flex justify-end w-full">
        <NumberInput
          size="xs"
          value={value}
          onChange={setValue}
          prefix="$"
          thousandSeparator=","
          allowNegative={false}
          decimalScale={2}
          w={130}
          autoFocus
          rightSection={<span className="text-xs text-gray-400 pr-1">/mo</span>}
          rightSectionWidth={36}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      </div>
    );
  }

  if (!hasBudget) {
    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <Budget merchantCategory={category} monthsMultiplier={monthsMultiplier} />
        <Button size="compact-xs" variant="light" onClick={startEditing}>
          Set budget
        </Button>
      </div>
    );
  }

  return (
    <div className="group/budget flex items-center gap-1.5 w-full">
      <div className="flex-1 min-w-0 cursor-pointer" onClick={startEditing}>
        <Budget merchantCategory={category} monthsMultiplier={monthsMultiplier} />
      </div>
      <Tooltip label="Edit monthly budget" withArrow openDelay={300}>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          aria-label="Edit monthly budget"
          onClick={startEditing}
          className="sm:opacity-0 sm:group-hover/budget:opacity-100 transition-opacity"
        >
          <IconPencil size={14} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
