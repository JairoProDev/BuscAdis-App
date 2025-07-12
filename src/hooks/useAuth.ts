import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '../features/auth/types/auth.types';
import type { AuthUser } from '@/types/api';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkSession = useCallback(async () => {
        try {
            setLoading(true);
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error checking session:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();

        // Verificar la sesión cada 15 minutos
        const intervalId = setInterval(checkSession, 15 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [checkSession]);

    const login = async (credentials: { email: string; password: string }) => {
        setLoading(true);
        try {
            const result = await AuthService.login(credentials) as AuthResponse;
            if (result.error) {
                return { success: false, message: result.error };
            }
            await checkSession();
            return { success: true };
        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error durante el inicio de sesión'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkSession
    };
}