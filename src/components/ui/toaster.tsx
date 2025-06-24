// src\components\ui\Toaster.tsx
'use client';

import Toast from '@/components/ui/Toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast 
            key={id} 
            id={id}
            title={title as string}
            message={description as string}
            onRemove={dismiss}
            type={props.type}
          />
        );
      })}
    </div>
  );
}