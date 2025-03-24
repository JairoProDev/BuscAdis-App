import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    QueryCommand, 
    ScanCommand,
    DeleteCommand,
    UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';
import { awsConfig } from '@/lib/aws-config';

interface MediaItem {
    url: string;
    type: string;
}

interface Location {
    district?: { id: string; name: string };
    region?: { id: string; name: string };
    coordinates?: { lat: number; lon: number } | null;
    city?: string;
    country?: string;
}

interface Price {
    amount: number;
    currency: string;
    type: string;
}

export interface QuickPublicationData {
    title: string;
    description: string;
    category?: { id: string; name: string; subcategories?: Array<{ id: string; name: string; selected?: boolean }> };
    type?: string;
    contact: { whatsapp: string; email?: string };
    media: MediaItem[];
    location?: Location;
    price?: Price;
    priceType?: string;
}

interface PublicationParams {
    category?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    page: number;
    limit?: number;
}

export class PublicationsService {
    private static client = new DynamoDBClient(awsConfig);
    private static docClient = DynamoDBDocumentClient.from(this.client);

    static async createPublication(data: QuickPublicationData): Promise<{ id: string }> {
        try {
            if (!data.title || !data.description) {
                throw new Error('El título y la descripción son obligatorios');
            }

            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const publicationId = uuidv4();
            
            const command = new PutCommand({
                TableName: 'Publications',
                Item: {
                    id: publicationId,
                    userId: currentUser.id,
                    title: data.title,
                    description: data.description,
                    price: data.price?.amount || 0,
                    priceType: data.price?.type || 'fixed',
                    category: data.category?.id || 'otros',
                    location: {
                        city: data.location?.city || '',
                        region: data.location?.region?.name || '',
                        coordinates: data.location?.coordinates || null
                    },
                    contact: {
                        whatsapp: data.contact?.whatsapp || '',
                        email: data.contact?.email || ''
                    },
                    media: data.media || [],
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            });

            await this.docClient.send(command);
            return { id: publicationId };
        } catch (error) {
            console.error('Error creating publication:', error);
            throw error;
        }
    }

    static async getPublicationById(id: string): Promise<any> {
        try {
            const command = new GetCommand({
                TableName: 'Publications',
                Key: { id }
            });

            const response = await this.docClient.send(command);
            return response.Item;
        } catch (error) {
            console.error('Error getting publication:', error);
            throw error;
        }
    }

    static async getPublicationsByUser(userId: string): Promise<any[]> {
        try {
            const command = new QueryCommand({
                TableName: 'Publications',
                IndexName: 'UserIdIndex',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            });

            const response = await this.docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error('Error getting user publications:', error);
            throw error;
        }
    }

    static async getPublications(params: PublicationParams): Promise<{ publications: any[], total: number, pages: number }> {
        try {
            const filterExpressions: string[] = [];
            const expressionAttributeValues: Record<string, any> = {};
            
            if (params.category) {
                filterExpressions.push('category = :category');
                expressionAttributeValues[':category'] = params.category;
            }
            
            if (params.query) {
                filterExpressions.push('contains(title, :query) OR contains(description, :query)');
                expressionAttributeValues[':query'] = params.query;
            }
            
            if (params.minPrice) {
                filterExpressions.push('price >= :minPrice');
                expressionAttributeValues[':minPrice'] = Number(params.minPrice);
            }
            
            if (params.maxPrice) {
                filterExpressions.push('price <= :maxPrice');
                expressionAttributeValues[':maxPrice'] = Number(params.maxPrice);
            }
            
            if (params.location) {
                filterExpressions.push('contains(location.city, :location) OR contains(location.region, :location)');
                expressionAttributeValues[':location'] = params.location;
            }

            const command = new ScanCommand({
                TableName: 'Publications',
                FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
                ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
                Limit: params.limit || 20
            });

            const response = await this.docClient.send(command);
            
            let sortedItems = response.Items || [];
            
            if (params.sortBy) {
                switch (params.sortBy) {
                    case 'price_asc':
                        sortedItems.sort((a, b) => (a.price || 0) - (b.price || 0));
                        break;
                    case 'price_desc':
                        sortedItems.sort((a, b) => (b.price || 0) - (a.price || 0));
                        break;
                    case 'date_desc':
                        sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        break;
                    case 'date_asc':
                        sortedItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        break;
                    default:
                        sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }
            }
            
            const startIndex = (params.page - 1) * (params.limit || 20);
            const paginatedItems = sortedItems.slice(startIndex, startIndex + (params.limit || 20));
            
            return {
                publications: paginatedItems,
                total: sortedItems.length,
                pages: Math.ceil(sortedItems.length / (params.limit || 20))
            };
        } catch (error) {
            console.error('Error getting publications:', error);
            throw error;
        }
    }

    static async updatePublication(id: string, data: Partial<QuickPublicationData>): Promise<any> {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            const publication = await this.getPublicationById(id);
            if (!publication) {
                throw new Error('Anuncio no encontrado');
            }
            
            if (publication.userId !== currentUser.id) {
                throw new Error('No tienes permiso para editar este anuncio');
            }
            
            let updateExpression = 'SET updatedAt = :updatedAt';
            const expressionAttributeValues: Record<string, any> = {
                ':updatedAt': new Date().toISOString()
            };
            
            if (data.title) {
                updateExpression += ', title = :title';
                expressionAttributeValues[':title'] = data.title;
            }
            
            if (data.description) {
                updateExpression += ', description = :description';
                expressionAttributeValues[':description'] = data.description;
            }
            
            if (data.price) {
                updateExpression += ', price = :price';
                expressionAttributeValues[':price'] = data.price.amount;
                
                updateExpression += ', priceType = :priceType';
                expressionAttributeValues[':priceType'] = data.price.type;
            }
            
            if (data.category) {
                updateExpression += ', category = :category';
                expressionAttributeValues[':category'] = data.category;
            }
            
            if (data.location) {
                updateExpression += ', location = :location';
                expressionAttributeValues[':location'] = {
                    city: data.location.city || '',
                    region: data.location.region || '',
                    coordinates: data.location.coordinates || null
                };
            }
            
            if (data.contact) {
                updateExpression += ', contact = :contact';
                expressionAttributeValues[':contact'] = {
                    whatsapp: data.contact.whatsapp || '',
                    email: data.contact.email || ''
                };
            }
            
            if (data.media) {
                updateExpression += ', media = :media';
                expressionAttributeValues[':media'] = data.media;
            }
            
            if (data.isActive !== undefined) {
                updateExpression += ', isActive = :isActive';
                expressionAttributeValues[':isActive'] = data.isActive;
            }
            
            const command = new UpdateCommand({
                TableName: 'Publications',
                Key: { id },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            });
            
            const response = await this.docClient.send(command);
            return response.Attributes;
        } catch (error) {
            console.error('Error updating publication:', error);
            throw error;
        }
    }

    static async deletePublication(id: string): Promise<{ success: boolean }> {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            const publication = await this.getPublicationById(id);
            if (!publication) {
                throw new Error('Anuncio no encontrado');
            }
            
            if (publication.userId !== currentUser.id) {
                throw new Error('No tienes permiso para eliminar este anuncio');
            }
            
            const command = new DeleteCommand({
                TableName: 'Publications',
                Key: { id }
            });
            
            await this.docClient.send(command);
            return { success: true };
        } catch (error) {
            console.error('Error deleting publication:', error);
            throw error;
        }
    }

    static async getAllPublications(): Promise<any[]> {
        try {
            console.log("Fetching publications with config:", awsConfig);
            const command = new ScanCommand({
                TableName: 'Publications',
                FilterExpression: 'isActive = :isActive',
                ExpressionAttributeValues: {
                    ':isActive': true
                }
            });

            const { Items: publications } = await this.docClient.send(command);
            return publications || [];
        } catch (error) {
            console.error('Error getting publications:', error);
            return [];
        }
    }
}