export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
