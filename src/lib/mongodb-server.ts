"use server";

/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient, ObjectId } from 'mongodb';
import { MongoClientInterface, PublicationDocument, COLLECTIONS } from './mongodb-shared';
import { Logger } from '@/services/logging.service';

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Create cached connection variable
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

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
    Logger.debug('Using cached MongoDB connection');
    return createServerMongoClient(cachedClient, cachedDb);
  }

  try {
    Logger.info('Establishing new MongoDB connection...');
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    Logger.info('MongoDB connected successfully');
    return createServerMongoClient(client, db);
  } catch (error) {
    Logger.error('MongoDB connection error', { error });
    throw new Error('Failed to connect to MongoDB');
  }
};

function createServerMongoClient(client: MongoClient, db: any): MongoClientInterface {
  return {
    async fetchPublications(
      category: string,
      page = 1,
      limit = 20,
      filters: Record<string, any> = {},
    ) {
      try {
        // Determine which collection to use based on category
        const collectionName = getCollectionName(category);
        
        // Check if the collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          Logger.debug(`Collection ${collectionName} does not exist yet`);
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
        Logger.error('Error fetching publications', { error, category, page, limit });
        return { publications: [], totalCount: 0 };
      }
    },
    
    async fetchPublicationById(id: string, category: string) {
      try {
        const collectionName = getCollectionName(category);
        const collection = db.collection(collectionName);
        return await collection.findOne({ _id: new ObjectId(id) });
      } catch (error) {
        Logger.error('Error fetching publication by ID', { error, id, category });
        return null;
      }
    },
    
    async fetchPublicationsByUser(userId: string) {
      try {
        const allPublications: any[] = [];
        
        // Search across all category collections
        for (const collectionName of Object.values(COLLECTIONS)) {
          try {
            const collection = db.collection(collectionName);
            const publications = await collection
              .find({ userId })
              .sort({ createdAt: -1 })
              .toArray();
            
            allPublications.push(...publications);
          } catch (err) {
            Logger.error(`Error fetching from ${collectionName}`, { error: err, userId });
          }
        }
        
        // Sort by creation date
        allPublications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return allPublications;
      } catch (error) {
        Logger.error('Error fetching publications by user', { error, userId });
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
        Logger.error('Error creating publication', { error, data });
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
        Logger.error('Error updating publication', { error, id, category });
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
        Logger.error('Error deleting publication', { error, id, category });
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

function buildQuery(filters: Record<string, any>): any {
  const query: any = {};
  
  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
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