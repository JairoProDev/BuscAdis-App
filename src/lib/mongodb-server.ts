/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient, ObjectId, Db, Document } from 'mongodb';
import { MongoClientInterface, PublicationDocument, COLLECTIONS } from './mongodb-shared';
import { LoggingService } from '@/services/logging.service';

// Nuevas interfaces para reemplazar 'any'
export interface MongoDbDocument extends Document {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicationFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  status?: 'activo' | 'vencido' | 'historico';
  premium?: boolean;
  userId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface MongoQueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  projection?: Record<string, 0 | 1>;
  collation?: {
    locale: string;
    strength?: number;
  };
}

export interface MongoUpdateData {
  $set?: Record<string, unknown>;
  $push?: Record<string, unknown>;
  $pull?: Record<string, unknown>;
  $inc?: Record<string, number>;
  $unset?: Record<string, string>;
  [key: string]: unknown;
}

export interface MongoQueryResult<T = MongoDbDocument> {
  documents: T[];
  totalCount: number;
  hasMore: boolean;
}

export interface MongoInsertResult {
  insertedId: ObjectId;
  acknowledged: boolean;
  insertedCount: number;
}

export interface MongoUpdateResult {
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  acknowledged: boolean;
}

export interface MongoDeleteResult {
  deletedCount: number;
  acknowledged: boolean;
}

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Create cached connection variable
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Connection options with better timeouts and retries
const connectionOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
};

// Create a new MongoDB client with connection pooling and error handling
export const getServerMongoClient = async (): Promise<MongoClientInterface> => {
  if (cachedClient && cachedDb) {
    LoggingService.getInstance().debug('Using cached MongoDB connection');
    return createServerMongoClient(cachedClient, cachedDb);
  }

  try {
    LoggingService.getInstance().info('Establishing new MongoDB connection...');
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    LoggingService.getInstance().info('MongoDB connected successfully');
    return createServerMongoClient(client, db);
  } catch (error) {
    LoggingService.getInstance().error('MongoDB connection error', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to connect to MongoDB');
  }
};

function createServerMongoClient(client: MongoClient, db: Db): MongoClientInterface {
  return {
    async fetchPublications(
      category: string,
      page = 1,
      limit = 20,
      filters: PublicationFilters = {},
    ) {
      try {
        // Determine which collection to use based on category
        const collectionName = getCollectionName(category);
        
        // Check if the collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          LoggingService.getInstance().debug(`Collection ${collectionName} does not exist yet`);
          return { publications: [], totalCount: 0 };
        }
        
        const collection = db.collection(collectionName);
        
        // Building the query
        const query = buildQuery(filters);
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Execute query
        const publications = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        
        // Get total count for pagination
        const totalCount = await collection.countDocuments(query);
        
        return { publications, totalCount };
      } catch (error) {
        LoggingService.getInstance().error('Error fetching publications', { error: error instanceof Error ? error.message : String(error), category, page, limit });
        return { publications: [], totalCount: 0 };
      }
    },
    
    async fetchPublicationById(id: string, category: string) {
      try {
        const collectionName = getCollectionName(category);
        const collection = db.collection(collectionName);
        return await collection.findOne({ _id: new ObjectId(id) });
      } catch (error) {
        LoggingService.getInstance().error('Error fetching publication by ID', { error: error instanceof Error ? error.message : String(error), id, category });
        return null;
      }
    },
    
    async fetchPublicationsByUser(userId: string) {
      try {
        const allPublications: PublicationDocument[] = [];
        
        // Search across all category collections
        for (const collectionName of Object.values(COLLECTIONS)) {
          try {
            const collection = db.collection(collectionName);
            const publications = await collection
              .find({ userId })
              .sort({ createdAt: -1 })
              .toArray();
            
            allPublications.push(...(publications as MongoDbDocument[]));
          } catch (err) {
            LoggingService.getInstance().error(`Error fetching from ${collectionName}`, { error: err instanceof Error ? err.message : String(err), userId });
          }
        }
        
        // Sort by creation date
        allPublications.sort((a, b) => 
          new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime()
        );
        
        return allPublications;
      } catch (error) {
        LoggingService.getInstance().error('Error fetching publications by user', { error: error instanceof Error ? error.message : String(error), userId });
        return [];
      }
    },
    
    async createPublication(data: PublicationDocument) {
      try {
        const collectionName = getCollectionName(data.categorySlug);
        const collection = db.collection(collectionName);
        
        const publicationData = {
          ...data,
          _id: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const result = await collection.insertOne(publicationData);
        return { ...publicationData, _id: result.insertedId };
      } catch (error) {
        LoggingService.getInstance().error('Error creating publication', { error: error instanceof Error ? error.message : String(error), data });
        throw error;
      }
    },
    
    async updatePublication(id: string, category: string, data: Partial<PublicationDocument>) {
      try {
        const collectionName = getCollectionName(category);
        const collection = db.collection(collectionName);
        
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };
        
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        return result.matchedCount > 0;
      } catch (error) {
        LoggingService.getInstance().error('Error updating publication', { error: error instanceof Error ? error.message : String(error), id, category });
        throw error;
      }
    },
    
    async deletePublication(id: string, category: string) {
      try {
        const collectionName = getCollectionName(category);
        const collection = db.collection(collectionName);
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
      } catch (error) {
        LoggingService.getInstance().error('Error deleting publication', { error: error instanceof Error ? error.message : String(error), id, category });
        throw error;
      }
    },
  };
}

// Helper functions
function getCollectionName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'inmuebles': COLLECTIONS.PUBLICATIONS_INMUEBLES,
    'vehiculos': COLLECTIONS.PUBLICATIONS_VEHICULOS,
    'empleos': COLLECTIONS.PUBLICATIONS_EMPLEOS,
    'servicios': COLLECTIONS.PUBLICATIONS_SERVICIOS,
    'productos': COLLECTIONS.PUBLICATIONS_PRODUCTOS,
    'eventos': COLLECTIONS.PUBLICATIONS_EVENTOS,
    'negocios': COLLECTIONS.PUBLICATIONS_NEGOCIOS,
    'comunidad': COLLECTIONS.PUBLICATIONS_COMUNIDAD,
  };
  
  return categoryMap[category] || COLLECTIONS.PUBLICATIONS_INMUEBLES;
}

function buildQuery(filters: PublicationFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  
  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) (query.price as Record<string, number>).$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filters.maxPrice;
  }
  
  // Location filter
  if (filters.location) {
    query.location = filters.location;
  }
  
  // Subcategory filter
  if (filters.subcategory) {
    query.subcategory = filters.subcategory;
  }
  
  // Search query filter
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return query;
}

// Additional exports for compatibility with existing API routes
export const clientPromise = new Promise<MongoClient>(async (resolve, reject) => {
  try {
    if (cachedClient) {
      resolve(cachedClient);
      return;
    }
    
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    await client.connect();
    cachedClient = client;
    resolve(client);
  } catch (error) {
    reject(error);
  }
});

// Direct MongoDB client getter (for auth routes)
export const getMongoClient = async (): Promise<MongoClient> => {
  if (cachedClient) {
    return cachedClient;
  }
  
  try {
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    LoggingService.getInstance().error('Error getting MongoDB client', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

// Query helper functions for API routes
export const mongoDbQuery = async (
  collectionName: string, 
  query: Record<string, unknown> = {}, 
  options: MongoQueryOptions = {}
): Promise<MongoDbDocument[]> => {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(collectionName);
    
    return await collection.find(query, options).toArray();
  } catch (error) {
    LoggingService.getInstance().error('Error in mongoDbQuery', { error: error instanceof Error ? error.message : String(error), collectionName, query });
    throw error;
  }
};

export const mongoDbGetById = async (
  collectionName: string, 
  id: string
): Promise<MongoDbDocument | null> => {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(collectionName);
    
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    LoggingService.getInstance().error('Error in mongoDbGetById', { error: error instanceof Error ? error.message : String(error), collectionName, id });
    throw error;
  }
};

export const mongoDbInsert = async (
  collectionName: string, 
  document: MongoDbDocument
): Promise<MongoInsertResult> => {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(collectionName);
    
    const result = await collection.insertOne({
      ...document,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { 
      insertedId: result.insertedId, 
      acknowledged: result.acknowledged,
      insertedCount: 1
    };
  } catch (error) {
    LoggingService.getInstance().error('Error in mongoDbInsert', { error: error instanceof Error ? error.message : String(error), collectionName });
    throw error;
  }
};

export const mongoDbUpdate = async (
  collectionName: string, 
  filter: Record<string, unknown>, 
  update: MongoUpdateData
): Promise<MongoUpdateResult> => {
  try {
    const client = await getMongoClient();
    const db = client.db(MONGODB_DB);
    const collection = db.collection(collectionName);
    
    const result = await collection.updateOne(filter, {
      $set: {
        ...update,
        updatedAt: new Date()
      }
    });
    
    return result;
  } catch (error) {
    LoggingService.getInstance().error('Error in mongoDbUpdate', { error: error instanceof Error ? error.message : String(error), collectionName, filter });
    throw error;
  }
}; 