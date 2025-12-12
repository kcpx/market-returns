'use client';

interface DataErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DataError({ message = 'Failed to load market data', onRetry }: DataErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-900/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-200 mb-2">Unable to Load Data</h3>
        <p className="text-sm text-neutral-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
