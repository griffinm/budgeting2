import { Alert } from "@mantine/core";

export function Errors({
  errors
}: {
  errors: string[];
}) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Alert color="red" title="Errors">
      <ul className="list-disc list-inside">
        {errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </Alert>
  )
}
