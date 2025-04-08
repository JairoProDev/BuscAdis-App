import { Logger } from '@/services/logging.service';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

export interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    dni?: string;
    createdAt?: number;
}

export class AuthService {
    // Client-side version with API calls
    private static async fetchFromAPI(endpoint: string, method: string = 'GET', body: any = null) {
        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`/api/auth/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            Logger.error(`API error in ${endpoint}`, { error });
            return { data: null, error: 'Error de conexión' };
        }
    }

    static async register({ firstName, lastName, phone, dni }) {
        try {
            if (isBrowser) {
                return this.fetchFromAPI('register', 'POST', { firstName, lastName, phone, dni });
            }
            
            // Server-side implementation would be here
            // This would use the actual MongoDB client directly
            Logger.info('User registration initiated', { phone });
            
            // Mock success response for now
            return { data: { message: 'Usuario registrado correctamente' }, error: null };
        } catch (error) {
            Logger.error('Error en registro:', { error });
            return { data: null, error };
        }
    }

    static async login({ phone, dni }) {
        try {
            if (isBrowser) {
                return this.fetchFromAPI('login', 'POST', { phone, dni });
            }
            
            // Server-side implementation would be here
            Logger.info('User login attempt', { phone });
            
            // Mock successful login for now
            return { 
                data: {
                    id: 'user123',
                    firstName: 'Usuario',
                    lastName: 'De Prueba',
                    phone,
                    dni
                }, 
                error: null 
            };
        } catch (error) {
            Logger.error('Error en login:', { error });
            return { data: null, error };
        }
    }
    
    static async getCurrentUser(): Promise<User | null> {
        try {
            if (isBrowser) {
                // In browser, check local storage or cookie for user data
                const userData = localStorage.getItem('userData');
                if (userData) {
                    return JSON.parse(userData);
                }
                
                // If no local data, make an API call to check session
                const { data } = await this.fetchFromAPI('me');
                return data;
            }
            
            // Server-side implementation would be here
            // This would check session data or token
            
            // For development purposes, return a mock user
            return {
                id: 'user123',
                name: 'Usuario de Prueba',
                phone: '123456789',
                email: 'usuario@ejemplo.com'
            };
        } catch (error) {
            Logger.error('Error getting current user:', { error });
            return null;
        }
    }
}