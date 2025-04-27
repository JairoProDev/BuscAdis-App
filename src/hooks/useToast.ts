import { useState, useCallback } from 'react'

interface ToastProps {
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface Toast extends ToastProps {
  id: string
}

// Un hook simple para mostrar notificaciones toast en la aplicación
export default function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Mostrar un nuevo toast
  const showToast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = {
      id,
      title: props.title,
      message: props.message,
      type: props.type || 'info',
      duration: props.duration || 3000
    }

    setToasts(prev => [...prev, toast])

    // Eliminar automáticamente después de la duración
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)

    return id
  }, [])

  // Eliminar un toast específico
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast
  }
} 