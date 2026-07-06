"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="text-[80px] font-black text-gray-200 leading-none select-none">!</div>
              <h1 className="text-xl font-bold text-gray-900 -mt-2">Something went wrong</h1>
              <p className="text-sm text-gray-400 mt-2">
                An unexpected error occurred. Please try again.
              </p>
            </div>

            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
