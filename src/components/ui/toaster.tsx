// src\components\ui\Toaster.tsx
'use client';

import { useToast } from '@/components/ui/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from '@/components/ui/Toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        );
      })}
    </div>
  );
}