// src/services/auth.service.ts

import clientPromise from '@/lib/mongodb';

interface User {
    phone: string;
    dni: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}

interface LoginCredentials {
    phone: string;
    dni: string;
}

interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
}

export class AuthService {
    private static async getCollection() {
        const client = await clientPromise;
        const db = client.db('test');
        return db.collection('users');
    }

    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const users = await this.getCollection();
            
            const user = await users.findOne({
                phone: credentials.phone,
                dni: credentials.dni
            });

            if (user) {
                return {
                    success: true,
                    user: user as unknown as User
                };
            }

            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error al iniciar sesión'
            };
        }
    }

    static async register(user: LoginCredentials): Promise<AuthResponse> {
        try {
            const users = await this.getCollection();
            
            // Primero verificamos si el usuario ya existe
            const existingUser = await users.findOne({
                phone: user.phone,
                dni: user.dni
            });

            if (existingUser) {
                return {
                    success: false,
                    message: 'Ya existe un usuario con este teléfono y DNI'
                };
            }

            // Si no existe, creamos el nuevo usuario
            const now = new Date().toISOString();
            const newUser: User = {
                id: `user_${Date.now()}`,
                phone: user.phone,
                dni: user.dni,
                createdAt: now,
                updatedAt: now
            };

            await users.insertOne(newUser);

            return {
                success: true,
                user: newUser
            };
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                message: 'Error al registrar el usuario'
            };
        }
    }

    static async logout(): Promise<{ success: boolean; message?: string }> {
        try {
            // Implementa la lógica para cerrar sesión aquí
            return { success: true };
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return { 
                success: false, 
                message: error instanceof Error ? error.message : 'Error desconocido' 
            };
        }
    }

    static async getCurrentUser(): Promise<User | null> {
        try {
            const response = await fetch('http://localhost:3000/api/user', {
                credentials: 'include',
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.user as User;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }
}