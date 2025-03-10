'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Iniciar sesión" 
      subtitle="Accede a tu cuenta para publicar anuncios"
    >
      <LoginForm />
    </AuthLayout>
  );
}
