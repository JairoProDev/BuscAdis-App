import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  open?: boolean;
  onRemove: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export default function Toast({
  id,
  title,
  message,
  type = 'info',
  onRemove
}: ToastProps) {
  const typeStyles = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className={`flex items-center justify-between p-4 rounded-lg shadow-lg ${typeStyles[type]} min-w-72 max-w-md`}
    >
      <div className="flex-1">
        {title && <div className="text-sm font-semibold mb-1">{title}</div>}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="ml-3 flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Cerrar notificación"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
} 