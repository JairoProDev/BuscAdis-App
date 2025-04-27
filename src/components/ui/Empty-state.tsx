import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  message = 'No hay contenido disponible',
  icon = null,
  action = null,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-medium text-primary-600 mb-2">{title}</h3>}
      <p className="text-slate-400">{description || message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState; 