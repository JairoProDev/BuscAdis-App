import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Environment variable check for region
if (!process.env.NEXT_PUBLIC_AWS_REGION) {
    throw new Error('NEXT_PUBLIC_AWS_REGION environment variable is not defined.');
}

let client: DynamoDBClient;

async function getDynamoDBClient() {
    if (!client) {
        try {
            // Usar credenciales estáticas en desarrollo local
            if (process.env.NODE_ENV === 'development') {
                if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
                    throw new Error('AWS credentials are not defined in development.');
                }
                client = new DynamoDBClient({
                    region: process.env.NEXT_PUBLIC_AWS_REGION,
                    credentials: {
                        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
                    },
                });
            } else {
                // Preparación para integración con Cognito en producción
                // Aquí iría la lógica para obtener credenciales de Cognito
                // Por ahora, lanzamos un error para recordar la implementación
                throw new Error('Cognito integration is required for production.');
            }
        } catch (error) {
            console.error('Error initializing DynamoDB client:', error);
            throw new Error(`Error initializing DynamoDB client: ${error.message}`);
        }
    }
    return client;
}

const getDocClient = async () => {
    const dynamoDBClient = await getDynamoDBClient();
    return DynamoDBDocumentClient.from(dynamoDBClient);
};

interface SearchPublicationsParams {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
}

interface SearchResults {
    publications: any[];
    total: number;
    pages: number;
}

export class SearchService {
    static async searchPublications(params: SearchPublicationsParams): Promise<SearchResults> {
        const { page = 1, limit = 20 } = params;

        try {
            const docClient = await getDocClient();
            let items: any[] = [];
            let total = 0;

            console.log("Filters received:", params); // Log de los filtros recibidos

            // Modificación: Eliminar todos los filtros del ScanCommand
            const scanParams: any = {
                TableName: 'Publications',
            };

            const countCommand = new ScanCommand({
                ...scanParams,
                Select: 'COUNT',
            });

            const countResult = await docClient.send(countCommand);
            total = countResult.Count || 0;

            if (total > 0) {
                const command = new ScanCommand({
                    ...scanParams,
                    Limit: limit,
                    ExclusiveStartKey: (page - 1) * limit > 0 ? undefined : undefined, // Corregir paginación
                });

                const { Items } = await docClient.send(command);
                items = Items || [];
            }

            console.log("Items found:", items); // Log de los items encontrados

            return {
                publications: items,
                total: total,
                pages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error searching publications:', error);
            throw new Error(`Error searching publications: ${error.message}`);
        }
    }
}