export function Loading({
  fullHeight=true,
}: {
  fullHeight?: boolean;
}) {
  return (
    <div className={`flex justify-center items-center ${fullHeight ? 'h-screen' : 'h-full'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}