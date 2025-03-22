import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
    }
});

const docClient = DynamoDBDocumentClient.from(client);

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
            const command = new QueryCommand({
                TableName: 'Users',
                IndexName: 'phone-dni-index',
                KeyConditionExpression: 'phone = :phone and dni = :dni',
                ExpressionAttributeValues: {
                    ':phone': credentials.phone,
                    ':dni': credentials.dni
                }
            });

            const result = await docClient.send(command);

            if (result.Items && result.Items.length > 0) {
                const userData = result.Items[0] as User;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { 
                    success: false, 
                    message: 'Teléfono o DNI incorrectos' 
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
