/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient, ObjectId, Db, Document } from 'mongodb';
import { LoggingService } from '@/services/logging.service';

// Nuevas interfaces para reemplazar 'any'
export interface MongoDbDocument extends Document {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicationDocument extends MongoDbDocument {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location?: {
    district?: string;
    province?: string;
    city?: string;
    country?: string;
  };
  pricing?: {
    amount: number;
    currency: string;
  };
  contact?: {
    phones?: string[];
    email?: string;
    name?: string;
  };
  images?: string[];
  status?: string;
  premium?: boolean;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoClientInterface {
  db: () => Db;
  close: () => Promise<void>;
  fetchPublications: (category: string, page?: number, limit?: number, filters?: PublicationFilters) => Promise<{ publications: Document[]; totalCount: number }>;
  createPublication: (data: Record<string, unknown>) => Promise<PublicationDocument>;
  updatePublication: (id: string, data: Record<string, unknown>) => Promise<PublicationDocument | null>;
  deletePublication: (id: string) => Promise<boolean>;
  getPublicationById: (id: string) => Promise<PublicationDocument | null>;
  searchPublications: (query: string, filters?: PublicationFilters) => Promise<PublicationDocument[]>;
}

export const COLLECTIONS = {
  ADISOS: 'adisos',
  USERS: 'users',
} as const;

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
    db: () => db,
    close: async () => await client.close(),
    
    async fetchPublications(
      category: string,
      page = 1,
      limit = 20,
      filters: PublicationFilters = {},
    ) {
      try {
        // Always use the unified adisos collection
        const collectionName = getCollectionName();
        
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
    
    
    async createPublication(data: Record<string, unknown>) {
      try {
        const collectionName = COLLECTIONS.ADISOS;
        const collection = db.collection(collectionName);
        
        const publicationData = {
          ...data,
          _id: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const result = await collection.insertOne(publicationData);
        return { ...publicationData, _id: result.insertedId } as PublicationDocument;
      } catch (error) {
        LoggingService.getInstance().error('Error creating publication', { error: error instanceof Error ? error.message : String(error), data });
        throw error;
      }
    },
    
    async updatePublication(id: string, data: Record<string, unknown>) {
      try {
        const collectionName = COLLECTIONS.ADISOS;
        const collection = db.collection(collectionName);
        
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };
        
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (result.matchedCount > 0) {
          return await collection.findOne({ _id: new ObjectId(id) }) as PublicationDocument | null;
        }
        return null;
      } catch (error) {
        LoggingService.getInstance().error('Error updating publication', { error: error instanceof Error ? error.message : String(error), id });
        throw error;
      }
    },
    
    async deletePublication(id: string) {
      try {
        const collectionName = COLLECTIONS.ADISOS;
        const collection = db.collection(collectionName);
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
      } catch (error) {
        LoggingService.getInstance().error('Error deleting publication', { error: error instanceof Error ? error.message : String(error), id });
        throw error;
      }
    },

    async getPublicationById(id: string) {
      try {
        const collectionName = COLLECTIONS.ADISOS;
        const collection = db.collection(collectionName);
        const result = await collection.findOne({ _id: new ObjectId(id) });
        return result as PublicationDocument | null;
      } catch (error) {
        LoggingService.getInstance().error('Error getting publication by ID', { error: error instanceof Error ? error.message : String(error), id });
        return null;
      }
    },

    async searchPublications(query: string, filters: PublicationFilters = {}) {
      try {
        const collectionName = COLLECTIONS.ADISOS;
        const collection = db.collection(collectionName);
        
        const searchQuery = {
          ...buildQuery(filters),
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        };
        
        const results = await collection.find(searchQuery).limit(20).toArray();
        return results as PublicationDocument[];
      } catch (error) {
        LoggingService.getInstance().error('Error searching publications', { error: error instanceof Error ? error.message : String(error), query });
        return [];
      }
    },
  };
}

// Helper functions
function getCollectionName(): string {
  // Always use the unified adisos collection
  return COLLECTIONS.ADISOS;
}

function buildQuery(filters: PublicationFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  
  // Price range filter
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    query.price = {};
    if (filters.priceMin !== undefined) (query.price as Record<string, number>).$gte = filters.priceMin;
    if (filters.priceMax !== undefined) (query.price as Record<string, number>).$lte = filters.priceMax;
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