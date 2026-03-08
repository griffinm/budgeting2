import { Alert } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

export function PendingTransaction() {
  return (
    <Alert color="yellow" variant="light">
      <div className="flex items-center gap-2">
        <IconClock className="w-4 h-4 text-yellow-500" />
        <span>This transaction is pending. The amount is still subject to change.</span>
      </div>
    </Alert>
  );
}