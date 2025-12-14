import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ColdStartAlertProps {
  show: boolean;
  timeRemaining: number;
  onDismiss: () => void;
}

export const ColdStartAlert = ({ show, timeRemaining, onDismiss }: ColdStartAlertProps) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Backend is warming up
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Our backend server is starting up (cold start). This typically takes about 1 minute on Render.
                <br />
                <br />
                Please wait we are checking every 3 sec to check if backend is up.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-yellow-600" />
                <span className="font-medium">
                  backend will start within {timeRemaining}s...
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              {/* <button
                onClick={() => window.location.reload()}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Refresh Now
              </button> */}
              <button
                onClick={onDismiss}
                className="text-yellow-600 border hover:text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="-mx-1.5 -my-1.5 bg-yellow-50 rounded-md p-1.5 inline-flex h-8 w-8 text-yellow-500 hover:bg-yellow-100 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
