import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    phone: string;
    dni: string;
    createdAt: number;
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
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } else {
                setUser(null);
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
        checkSession();
    }, [checkSession]);

    const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
        try {
            // Using the API route to authenticate
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success) {
                const userData = data.user as User;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { 
                    success: false, 
                    message: data.message || 'Teléfono o DNI incorrectos' 
                };
            }
        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                message: 'Error al iniciar sesión. Por favor, inténtalo de nuevo.'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/');
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
