export function DayHeader({ 
  date,
  transactionCount,
}: {
  date: string;
  transactionCount: number;
}) {
  return (
    <div className="sticky top-0 z-10 border-b bg-neutral-100 border-gray-300 py-2 px-3 flex flex-row justify-between">
      <h3 className="text-sm font-medium text-gray-700">
        {new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h3>
        {transactionCount > 0 && (
          <span className="text-xs text-gray-500">
            {transactionCount} transactions
          </span>
        )}
    </div>
  )
}
