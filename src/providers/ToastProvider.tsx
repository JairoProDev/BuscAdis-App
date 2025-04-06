'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '@/components/ui/ToastContainer';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
} 