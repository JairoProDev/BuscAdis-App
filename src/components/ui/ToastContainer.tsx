'use client';

import { useEffect, useState } from 'react';
import { Toast } from './Toast';
import { useToast as useToastHook } from '@/hooks/useToast';

// Contexto global para acceder al hook desde cualquier parte de la aplicación
export function ToastContainer() {
  const { toast, visible, hideToast } = useToastHook();

  if (!toast) return null;

  return (
    <Toast
      visible={visible}
      type={toast.type}
      title={toast.title}
      message={toast.message}
      icon={toast.icon}
      onClose={hideToast}
      duration={toast.duration}
    />
  );
}