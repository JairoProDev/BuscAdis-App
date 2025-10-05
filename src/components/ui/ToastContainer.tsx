'use client'

import { Toast, ToastClose, ToastDescription, ToastTitle } from './Toast'

interface ToastProps {
  id: string
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContainerProps {
  toasts: ToastProps[]
  removeToast: (id: string) => void
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.type === 'error' ? 'destructive' : 'default'}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          <ToastDescription>{toast.message}</ToastDescription>
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
    </div>
  )
} 