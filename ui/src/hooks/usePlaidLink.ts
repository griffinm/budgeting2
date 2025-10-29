import { useContext, useEffect, useState, useCallback } from "react";
import { usePlaidLink as usePlaidLinkSDK, PlaidLinkError, PlaidLinkOnExitMetadata } from "react-plaid-link";
import { createLinkToken, exchangePublicToken } from "@/api";
import { NotificationContext } from "@/providers";

interface UsePlaidLinkProps {
  onSuccess: () => void;
}

interface UsePlaidLinkReturn {
  open: () => void;
  ready: boolean;
  loading: boolean;
  error: Error | null;
}

export const usePlaidLink = ({ onSuccess }: UsePlaidLinkProps): UsePlaidLinkReturn => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useContext(NotificationContext);

  // Fetch link token when component mounts
  useEffect(() => {
    const fetchLinkToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await createLinkToken();
        setLinkToken(response.link_token);
      } catch (err) {
        const error = err as Error;
        setError(error);
        showNotification({
          title: "Error",
          message: "Failed to initialize Plaid Link. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLinkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccessCallback = useCallback(
    async (public_token: string) => {
      setLoading(true);
      try {
        const response = await exchangePublicToken(public_token);
        showNotification({
          title: "Success",
          message: `Successfully connected ${response.accounts.length} account(s)`,
          type: "success",
        });
        onSuccess();
      } catch (err) {
        const error = err as Error;
        setError(error);
        showNotification({
          title: "Error",
          message: "Failed to connect accounts. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, showNotification]
  );

  const onExitCallback = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: PlaidLinkError | null, _metadata: PlaidLinkOnExitMetadata) => {
      if (error) {
        console.error("Plaid Link error:", error);
        showNotification({
          title: "Connection Cancelled",
          message: "Account connection was cancelled or failed.",
          type: "error",
        });
      }
    },
    [showNotification]
  );

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
    onExit: onExitCallback,
  };

  const { open, ready } = usePlaidLinkSDK(config);

  return {
    open: () => open(),
    ready: ready && !loading,
    loading,
    error,
  };
};

