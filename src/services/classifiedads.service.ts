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

export interface QuickClassifiedadData {
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
    subcategories?: Array<{
      id: string;
      name: string;
      selected?: boolean;
    }>;
  };
  type?: string;
  contact: {
    whatsapp: string;
  };
  media: any[];
  location?: {
    district?: {
      id: string;
      name: string;
    };
    region?: {
      id: string;
      name: string;
    };
    coordinates?: {
      lat: number;
      lon: number;
    };
    city?: string;
    country?: string;
  };
  price?: {
    amount: number;
    currency: string;
    type: string;
  };
  priceType?: string;
}

export class ClassifiedadsService {
  private static client = new DynamoDBClient(awsConfig);
  private static docClient = DynamoDBDocumentClient.from(this.client);

  static async createClassifiedad(data) {
    try {
      // Validar datos requeridos
      if (!data.title || !data.description) {
        throw new Error('El título y la descripción son obligatorios');
      }

      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const classifiedadId = uuidv4();
      
      const command = new PutCommand({
        TableName: 'Classifiedads',
        Item: {
          id: classifiedadId,
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
      return { id: classifiedadId };
    } catch (error) {
      console.error('Error creating classifiedad:', error);
      throw error;
    }
  }

  static async getClassifiedadById(id) {
    try {
      const command = new GetCommand({
        TableName: 'Classifiedads',
        Key: { id }
      });

      const response = await this.docClient.send(command);
      return response.Item;
    } catch (error) {
      console.error('Error getting classifiedad:', error);
      throw error;
    }
  }

  static async getClassifiedadsByUser(userId) {
    try {
      const command = new QueryCommand({
        TableName: 'Classifiedads',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const response = await this.docClient.send(command);
      return response.Items;
    } catch (error) {
      console.error('Error getting user classifiedads:', error);
      throw error;
    }
  }

  static async getClassifiedads(params) {
    try {
      let filterExpressions = [];
      let expressionAttributeValues = {};
      
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
        TableName: 'Classifiedads',
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
        Limit: params.limit || 20
      });

      const response = await this.docClient.send(command);
      
      // Ordenar resultados según el parámetro sortBy
      let sortedItems = response.Items || [];
      
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'price_asc':
            sortedItems.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            sortedItems.sort((a, b) => b.price - a.price);
            break;
          case 'date_desc':
            sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'date_asc':
            sortedItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case 'featured':
            // Aquí podrías implementar una lógica para destacados
            break;
          default:
            sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
      
      // Implementar paginación manual
      const startIndex = (params.page - 1) * (params.limit || 20);
      const paginatedItems = sortedItems.slice(startIndex, startIndex + (params.limit || 20));
      
      return {
        classifiedads: paginatedItems,
        total: sortedItems.length,
        pages: Math.ceil(sortedItems.length / (params.limit || 20))
      };
    } catch (error) {
      console.error('Error getting classifiedads:', error);
      throw error;
    }
  }

  static async updateClassifiedad(id, data) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verificar que el anuncio pertenece al usuario
      const classifiedad = await this.getClassifiedadById(id);
      if (!classifiedad) {
        throw new Error('Anuncio no encontrado');
      }
      
      if (classifiedad.userId !== currentUser.id) {
        throw new Error('No tienes permiso para editar este anuncio');
      }
      
      // Construir expresiones de actualización
      let updateExpression = 'SET updatedAt = :updatedAt';
      let expressionAttributeValues = {
        ':updatedAt': new Date().toISOString()
      };
      
      // Actualizar solo los campos proporcionados
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
        TableName: 'Classifiedads',
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });
      
      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error('Error updating classifiedad:', error);
      throw error;
    }
  }

  static async deleteClassifiedad(id) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verificar que el anuncio pertenece al usuario
      const classifiedad = await this.getClassifiedadById(id);
      if (!classifiedad) {
        throw new Error('Anuncio no encontrado');
      }
      
      if (classifiedad.userId !== currentUser.id) {
        throw new Error('No tienes permiso para eliminar este anuncio');
      }
      
      const command = new DeleteCommand({
        TableName: 'Classifiedads',
        Key: { id }
      });
      
      await this.docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting classifiedad:', error);
      throw error;
    }
  }

  static async getClassifiedads() {
    try {
      console.log("Fetching classifiedads with config:", awsConfig);
      const command = new ScanCommand({
        TableName: 'Classifiedads',
        FilterExpression: 'isActive = :isActive',
        ExpressionAttributeValues: {
          ':isActive': true
        }
      });

      const { Items: classifiedads } = await this.docClient.send(command);
      return classifiedads || [];
    } catch (error) {
      console.error('Error getting classifiedads:', error);
      // Retorna un array vacío en caso de error para no interrumpir la carga de la página
      return [];
    }
  }
} 