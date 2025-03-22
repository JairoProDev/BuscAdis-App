import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    phone: string;
    dni: string;
}

interface LoginCredentials {
    phone: string;
    dni: string;
}

interface AuthResult {
    success: boolean;
    message?: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkSession = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Intentar recuperar usuario del localStorage al montar
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        
        // Verificar la sesión con el servidor
        checkSession();
        
        // Verificar la sesión cada 5 minutos
        const intervalId = setInterval(checkSession, 5 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    }, [checkSession]);

    const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // Actualizar el estado del usuario
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
            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                localStorage.removeItem('user');
                router.push('/');
            }
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
