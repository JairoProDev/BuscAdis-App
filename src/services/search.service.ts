import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

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
    publications: any[]; // Replace 'any' with your actual classified ad type
    total: number;
    pages: number;
}

export class SearchService {
    static async searchPublications(params: SearchPublicationsParams): Promise<SearchResults> {
        const { query, category, location, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = params;

        try {
            const docClient = await getDocClient();
            let items: any[] = [];
            let total = 0;

            // First, get the total count using a ScanCommand with only the filters.
            const countCommand = new ScanCommand({
                TableName: 'Publications',
                FilterExpression: 'isActive = :isActive' +
                    (query ? ' AND (contains(title, :query) OR contains(description, :query))' : '') +
                    (category ? ' AND categoryId = :category' : '') +
                    (location ? ' AND location = :location' : '') +
                    (minPrice !== undefined ? ' AND price >= :minPrice' : '') +
                    (maxPrice !== undefined ? ' AND price <= :maxPrice' : ''),
                ExpressionAttributeValues: {
                    ':isActive': true,
                    ...(query ? { ':query': query } : {}),
                    ...(category ? { ':category': category } : {}),
                    ...(location ? { ':location': location } : {}),
                    ...(minPrice !== undefined ? { ':minPrice': minPrice } : {}),
                    ...(maxPrice !== undefined ? { ':maxPrice': maxPrice } : {}),
                },
                Select: 'COUNT', // Specify that we only want the count
            });

            const countResult = await docClient.send(countCommand);
            total = countResult.Count || 0;

            // Calculate pagination parameters
            const offset = (page - 1) * limit;

            // Only fetch items if count is greater than 0
            if (total > 0) {
                // Then, get the paginated results, reusing the filter
                const command = new ScanCommand({
                    TableName: 'Publications',
                    FilterExpression: 'isActive = :isActive' +
                        (query ? ' AND (contains(title, :query) OR contains(description, :query))' : '') +
                        (category ? ' AND categoryId = :category' : '') +
                        (location ? ' AND location = :location' : '') +
                        (minPrice !== undefined ? ' AND price >= :minPrice' : '') +
                        (maxPrice !== undefined ? ' AND price <= :maxPrice' : ''),
                    ExpressionAttributeValues: {
                        ':isActive': true,
                        ...(query ? { ':query': query } : {}),
                        ...(category ? { ':category': category } : {}),
                        ...(location ? { ':location': location } : {}),
                        ...(minPrice !== undefined ? { ':minPrice': minPrice } : {}),
                        ...(maxPrice !== undefined ? { ':maxPrice': maxPrice } : {}),
                    },
                    Limit: limit,
                    ExclusiveStartKey: offset > 0 ? { id: '' } : undefined, // Placeholder, needs actual implementation
                });

                const { Items } = await docClient.send(command);
                items = Items || [];
            }

            // Add sorting in memory
            if (sortBy) {
                if (sortBy === 'price-asc') {
                    items.sort((a, b) => a.price - b.price);
                } else if (sortBy === 'price-desc') {
                    items.sort((a, b) => b.price - a.price);
                }
                // Add other sorting options as needed
            }

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
