export function BorderBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 mb-4 p-4 rounded-lg shadow-md">
      {children}
    </div>
  );
}