import { Tooltip } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

export function PendingBadge() {
  return (
    <div className="hidden md:block cursor-pointer">
      <Tooltip
        withArrow
        position="top"
        color="yellow"
        label={
          <div>
            <p>This transaction is pending.</p>
            <p>Pending transactions are not yet confirmed by the bank. The amount is still subject to change.</p>
          </div>
        }
      >
        <IconClock className="w-4 h-4 text-yellow-500" />
      </Tooltip>
    </div>
  )
}