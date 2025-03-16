import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Cache } from '@/utils/cache';
import { categories as staticCategories } from '@/data/categories';
import { awsConfig } from '@/lib/aws-config';

// Mapeo de nombres de iconos a componentes reales
import { 
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const iconMap = {
  'BriefcaseIcon': BriefcaseIcon,
  'HomeIcon': HomeIcon,
  'TruckIcon': TruckIcon,
  'WrenchIcon': WrenchIcon,
  'ShoppingBagIcon': ShoppingBagIcon,
  'GlobeAltIcon': GlobeAltIcon,
  'CalendarIcon': CalendarIcon,
  'AcademicCapIcon': AcademicCapIcon,
  'HeartIcon': HeartIcon
};

export const Categories = staticCategories; // Exporta las categorías estáticas

export class CategoriesService {
  static async getCategories() {
    try {
      const command = new ScanCommand({
        TableName: 'Categories'
      });
      
      const { Items: data } = await docClient.send(command);
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }
  
  static async getCategoryCount(categoryName: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Classifiedads',
        IndexName: 'CategoryIndex',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': categoryName.toLowerCase()
        },
        Select: 'COUNT'
      });

      const { Count } = await docClient.send(command);
      return Count || 0;
    } catch (error) {
      console.error(`Error fetching count for category ${categoryName}:`, error);
      return 0;
    }
  }
  
  static async getCategoryWithTypes(categoryId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'CategoryTypes',
        KeyConditionExpression: 'categoryId = :categoryId',
        ExpressionAttributeValues: {
          ':categoryId': categoryId
        }
      });

      const { Items: data } = await docClient.send(command);
      return data || [];
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      return null;
    }
  }
}
