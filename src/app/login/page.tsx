'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';
import { useState } from 'react'; // Importa useState

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true); // Estado para controlar el modal

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AuthLayout 
      title="Iniciar sesión" 
      subtitle="Accede a tu cuenta para publicar anuncios"
    >
      <LoginForm isOpen={isModalOpen} onClose={handleCloseModal} />
    </AuthLayout>
  );
}