import { useEffect } from 'react';
import { useAuthStore } from '@/services/auth.service.client';
import { useRouter } from 'next/navigation';
import { LoginCredentials } from '@/features/auth/types/auth.types';

export function useAuth() {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login: loginAction,
        logout: logoutAction,
        fetchUser,
    } = useAuthStore();
    
    const router = useRouter();

    useEffect(() => {
        if (!token && !isLoading) {
            // If there's no token and we're not loading,
            // there's no session to check.
            return;
        }
        if (token && !user && !isLoading) {
            fetchUser();
        }
    }, [token, user, isLoading]);

    const login = async (credentials: LoginCredentials) => {
        try {
            // The actual login logic should now be an API call
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Error durante el inicio de sesión' };
            }

            await loginAction(data.token);
            router.push('/mis-adisos');
            return { success: true };
        } catch (err) {
            console.error('Error during login:', err);
            const message = err instanceof Error ? err.message : 'Error de red o servidor';
            return { success: false, message };
        }
    };

    const logout = () => {
        logoutAction();
        router.push('/');
    };

    return {
        user,
        loading: isLoading,
        isAuthenticated,
        error,
        login,
        logout,
    };
}