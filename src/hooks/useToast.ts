import { useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id?: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
  icon?: ReactNode;
}

interface ToastState {
  toast: ToastProps | null;
  visible: boolean;
}

/**
 * Hook personalizado para mostrar notificaciones toast en la aplicación
 */
export function useToast() {
  const [toastState, setToastState] = useState<ToastState>({
    toast: null,
    visible: false
  });

  // Mostrar una notificación toast
  const showToast = useCallback((toast: ToastProps) => {
    // Generar un ID único si no se proporciona
    const toastWithId = {
      ...toast,
      id: toast.id || `toast-${Date.now()}`
    };

    // Establecer el estado del toast
    setToastState({
      toast: toastWithId,
      visible: true
    });

    // Auto-ocultar después de la duración especificada (o 3000ms por defecto)
    const duration = toast.duration || 3000;
    setTimeout(() => {
      hideToast();
    }, duration);
  }, []);

  // Ocultar el toast activo
  const hideToast = useCallback(() => {
    setToastState(prev => ({
      ...prev,
      visible: false
    }));

    // Limpiar el estado del toast después de la animación de salida
    setTimeout(() => {
      setToastState({
        toast: null,
        visible: false
      });
    }, 300); // Duración de la animación de salida
  }, []);

  return { 
    toast: toastState.toast,
    visible: toastState.visible,
    showToast,
    hideToast
  };
}

export default useToast; 