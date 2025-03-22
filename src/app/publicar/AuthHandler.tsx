// AuthHandler.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthPrompt from '@/features/auth/components/AuthPrompt';

interface AuthHandlerProps {
  children: React.ReactNode;
  publishData: any;
  onAuth: (data: any) => void;
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ children, publishData, onAuth }) => {
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && publishData) {
      setShowAuthPrompt(true);
    }
  }, [isAuthenticated, publishData]);

  if (showAuthPrompt) {
    return (
      <AuthPrompt
        publishData={publishData}
        onClose={() => setShowAuthPrompt(false)}
        onAuth={onAuth}
      />
    );
  }

  return <>{children}</>;
};

export default AuthHandler;