import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import { useRouter } from 'next/navigation';
import { AuthResponse, LoginCredentials } from '../features/auth/types/auth.types';
import type { AuthUser } from '@/types/api';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkSession = useCallback(async () => {
        try {
            setLoading(true);
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser as AuthUser | null);
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

    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            // Validate that required fields are present
            if (!credentials.phone || !credentials.dni) {
                return { 
                    success: false, 
                    message: 'Teléfono y DNI son requeridos' 
                };
            }

            const authCredentials = {
                phone: credentials.phone,
                dni: credentials.dni
            };

            const result = await AuthService.login(authCredentials) as AuthResponse;
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