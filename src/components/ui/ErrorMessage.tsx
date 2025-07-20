import { XCircleIcon } from '@heroicons/react/24/solid';

interface ErrorMessageProps {
  message: string | string[];
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          {messages.map((msg) => (
            <p key={`error-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="text-sm text-red-700">
              {msg}
            </p>
          ))}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 text-red-500 hover:text-red-700"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
