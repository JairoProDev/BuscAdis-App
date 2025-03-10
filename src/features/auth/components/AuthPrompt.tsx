import { useState } from 'react';
import Link from 'next/link';

interface AuthPromptProps {
  type: 'soft' | 'required';
  message?: string;
  onClose?: () => void;
}

export default function AuthPrompt({ type, message, onClose }: AuthPromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && type === 'soft') return null;

  return (
    <div className={`rounded-lg p-4 ${
      type === 'required' ? 'bg-primary-50' : 'bg-gray-50'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            {message || '¿Quieres sacar el máximo provecho? Crea una cuenta gratuita'}
          </p>
          <div className="mt-3 flex space-x-4">
            <Link
              href="/register"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        {type === 'soft' && (
          <button
            onClick={() => {
              setDismissed(true);
              onClose?.();
            }}
            className="ml-3 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
