import { Button } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { usePlaidLink } from "@/hooks";

interface ReconnectPlaidAccountProps {
  plaidAccessTokenId: number;
  onSuccess: () => void;
}

export const ReconnectPlaidAccount = ({ plaidAccessTokenId, onSuccess }: ReconnectPlaidAccountProps) => {
  const { open, ready, loading } = usePlaidLink({ onSuccess, plaidAccessTokenId });

  return (
    <Button
      color="red"
      variant="light"
      size="xs"
      leftSection={<IconAlertTriangle size={14} />}
      onClick={() => open()}
      disabled={!ready || loading}
      loading={loading}
    >
      Reconnect
    </Button>
  );
};
