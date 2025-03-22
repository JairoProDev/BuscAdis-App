import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    },
});

const docClient = DynamoDBDocumentClient.from(client);
const usersTable = process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE;

export class AuthService {
    static async register({ firstName, lastName, phone, dni }) {
        try {
            const params = {
                TableName: usersTable,
                Item: {
                    phone,
                    dni,
                    firstName,
                    lastName,
                    createdAt: Date.now(),
                },
                ConditionExpression: 'attribute_not_exists(phone)', // Evita duplicados
            };

            await docClient.send(new PutCommand(params));
            return { data: { message: 'Usuario registrado correctamente' }, error: null };
        } catch (error) {
            console.error('Error en registro:', error);
            return { data: null, error };
        }
    }

    static async login({ phone, dni }) {
        try {
            const params = {
                TableName: usersTable,
                Key: {
                    phone,
                    dni,
                },
            };

            const result = await docClient.send(new GetCommand(params));

            if (result.Item) {
                return { data: result.Item, error: null };
            } else {
                return { data: null, error: 'Credenciales incorrectas' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { data: null, error };
        }
    }
}