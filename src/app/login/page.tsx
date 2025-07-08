'use client';

import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleCloseModal = () => {
        router.push('/');
    };

    return (
        <AuthLayout 
            title="Iniciar sesión" 
            subtitle="Accede a tu cuenta para publicar anuncios"
        >
            <LoginForm />
        </AuthLayout>
    );
}