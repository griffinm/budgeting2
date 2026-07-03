import { Tooltip } from "@mantine/core";
import { IconArrowsSplit } from "@tabler/icons-react";

export function SplitBadge() {
  return (
    <div className="hidden md:block cursor-pointer">
      <Tooltip
        withArrow
        position="top"
        color="blue"
        label={<p>Part of a split transaction.</p>}
      >
        <IconArrowsSplit className="w-4 h-4 text-blue-500" />
      </Tooltip>
    </div>
  )
}
