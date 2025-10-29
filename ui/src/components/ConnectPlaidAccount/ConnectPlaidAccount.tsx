import { Button } from "@mantine/core";
import { usePlaidLink } from "@/hooks";

interface ConnectPlaidAccountProps {
  onSuccess: () => void;
}

export const ConnectPlaidAccount = ({ onSuccess }: ConnectPlaidAccountProps) => {
  const { open, ready, loading } = usePlaidLink({ onSuccess });

  return (
    <Button 
      onClick={() => open()} 
      disabled={!ready || loading}
      loading={loading}
    >
      Connect New Account
    </Button>
  );
};

