import { Tooltip } from "@mantine/core";
import { IconRepeat } from "@tabler/icons-react";

export function RecurringBadge() {
  return (
    <div className="hidden md:block cursor-pointer">
      <Tooltip
        withArrow
        position="top"
        color="teal"
        label={<p>Part of a confirmed recurring stream.</p>}
      >
        <IconRepeat className="w-4 h-4 text-teal-500" />
      </Tooltip>
    </div>
  )
}
