export function Errors({
  errors
}: {
  errors: string[];
}) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-200 text-red-500 p-2 rounded-md">
      <div className="mb-2 text-lg font-bold">Errors:</div>
      <ul className="list-disc list-inside">
        {errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
