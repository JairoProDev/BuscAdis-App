// src/services/auth.service.ts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
    }
});

const docClient = DynamoDBDocumentClient.from(client);

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
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const command = new QueryCommand({
                TableName: 'Users',
                IndexName: 'phone-dni-index',
                KeyConditionExpression: 'phone = :phone AND dni = :dni',
                ExpressionAttributeValues: {
                    ':phone': credentials.phone,
                    ':dni': credentials.dni
                }
            });

            const response = await docClient.send(command);

            if (response.Items && response.Items.length > 0) {
                return {
                    success: true,
                    user: response.Items[0] as User
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

    static async register(userData: LoginCredentials): Promise<AuthResponse> {
        try {
            // Primero verificamos si el usuario ya existe
            const checkCommand = new QueryCommand({
                TableName: 'Users',
                IndexName: 'phone-dni-index',
                KeyConditionExpression: 'phone = :phone AND dni = :dni',
                ExpressionAttributeValues: {
                    ':phone': userData.phone,
                    ':dni': userData.dni
                }
            });

            const existingUser = await docClient.send(checkCommand);

            if (existingUser.Items && existingUser.Items.length > 0) {
                return {
                    success: false,
                    message: 'Ya existe un usuario con este teléfono y DNI'
                };
            }

            // Si no existe, creamos el nuevo usuario
            const now = new Date().toISOString();
            const newUser: User = {
                id: `user_${Date.now()}`,
                phone: userData.phone,
                dni: userData.dni,
                createdAt: now,
                updatedAt: now
            };

            const command = new PutCommand({
                TableName: 'Users',
                Item: newUser
            });

            await docClient.send(command);

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