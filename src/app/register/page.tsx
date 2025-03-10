'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Crear cuenta" 
      subtitle="Únete a nuestra comunidad y empieza a publicar"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
