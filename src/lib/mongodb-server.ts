/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient, ObjectId } from 'mongodb';
import { MongoClientInterface } from './mongodb';
import { COLLECTIONS } from './mongodb-shared';
import { PublicationDocument } from '@/types/interfaces';
import { Category } from './mongodb';

// MongoDB connection string should be in environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'test';

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
    console.log('Using cached MongoDB connection');
    return createServerMongoClient(cachedClient, cachedDb);
  }

  try {
    console.log('Establishing new MongoDB connection...');
    const client = new MongoClient(MONGODB_URI, connectionOptions);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connected successfully');
    return createServerMongoClient(client, db);
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
        let collectionName: string = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        
        switch (category) {
          case 'inmuebles':
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
            break;
          case 'vehiculos':
            collectionName = COLLECTIONS.PUBLICATIONS_VEHICULOS;
            break;
          case 'empleos':
            collectionName = COLLECTIONS.PUBLICATIONS_EMPLEOS;
            break;
          case 'servicios':
            collectionName = COLLECTIONS.PUBLICATIONS_SERVICIOS;
            break;
          case 'productos':
            collectionName = COLLECTIONS.PUBLICATIONS_PRODUCTOS;
            break;
          case 'eventos':
            collectionName = COLLECTIONS.PUBLICATIONS_EVENTOS;
            break;
          case 'negocios':
            collectionName = COLLECTIONS.PUBLICATIONS_NEGOCIOS;
            break;
          case 'comunidad':
            collectionName = COLLECTIONS.PUBLICATIONS_COMUNIDAD;
            break;
          default:
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        }

        // Check if the collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          console.log(`Collection ${collectionName} does not exist yet`);
          return { publications: [], totalCount: 0 };
        }
        
        const collection = db.collection(collectionName);
        
        // Building the query
        const query: any = {};
        
        // Add filters
        if (filters.minPrice && filters.maxPrice) {
          query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
        } else if (filters.minPrice) {
          query.price = { $gte: filters.minPrice };
        } else if (filters.maxPrice) {
          query.price = { $lte: filters.maxPrice };
        }
        
        if (filters.location) {
          query.location = filters.location;
        }
        
        if (filters.subcategory) {
          query.subcategory = filters.subcategory;
        }
        
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
        console.error('Error fetching publications:', error);
        return { publications: [], totalCount: 0 };
      }
    },
    
    async fetchPublicationById(id: string, category: string) {
      try {
        // Determine which collection to use based on category
        let collectionName: string;
        
        switch (category) {
          case 'inmuebles':
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
            break;
          case 'vehiculos':
            collectionName = COLLECTIONS.PUBLICATIONS_VEHICULOS;
            break;
          case 'empleos':
            collectionName = COLLECTIONS.PUBLICATIONS_EMPLEOS;
            break;
          case 'servicios':
            collectionName = COLLECTIONS.PUBLICATIONS_SERVICIOS;
            break;
          case 'productos':
            collectionName = COLLECTIONS.PUBLICATIONS_PRODUCTOS;
            break;
          case 'eventos':
            collectionName = COLLECTIONS.PUBLICATIONS_EVENTOS;
            break;
          case 'negocios':
            collectionName = COLLECTIONS.PUBLICATIONS_NEGOCIOS;
            break;
          case 'comunidad':
            collectionName = COLLECTIONS.PUBLICATIONS_COMUNIDAD;
            break;
          default:
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        }
        
        const collection = db.collection(collectionName);
        return await collection.findOne({ _id: new ObjectId(id) });
      } catch (error) {
        console.error('Error fetching publication by ID:', error);
        return null;
      }
    },
    
    async fetchPublicationsByUser(userId: string) {
      try {
        const collections = [
          COLLECTIONS.PUBLICATIONS_INMUEBLES,
          COLLECTIONS.PUBLICATIONS_VEHICULOS,
          COLLECTIONS.PUBLICATIONS_EMPLEOS,
          COLLECTIONS.PUBLICATIONS_SERVICIOS,
          COLLECTIONS.PUBLICATIONS_PRODUCTOS,
          COLLECTIONS.PUBLICATIONS_EVENTOS,
          COLLECTIONS.PUBLICATIONS_NEGOCIOS,
          COLLECTIONS.PUBLICATIONS_COMUNIDAD
        ];
        
        const results = [];
        
        for (const collectionName of collections) {
          try {
            // Check if collection exists
            const collExists = await db.listCollections({ name: collectionName }).toArray();
            if (collExists.length === 0) {
              continue;
            }
            
            const collection = db.collection(collectionName);
            const items = await collection
              .find({ userId })
              .sort({ createdAt: -1 })
              .toArray();
            
            results.push(...items);
          } catch (err) {
            console.error(`Error fetching from ${collectionName}:`, err);
          }
        }
        
        return results;
      } catch (error) {
        console.error('Error fetching publications by user:', error);
        return [];
      }
    },
    
    async createPublication(data: PublicationDocument) {
      try {
        let collectionName: string;
        
        switch (data.category) {
          case 'inmuebles':
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
            break;
          case 'vehiculos':
            collectionName = COLLECTIONS.PUBLICATIONS_VEHICULOS;
            break;
          case 'empleos':
            collectionName = COLLECTIONS.PUBLICATIONS_EMPLEOS;
            break;
          case 'servicios':
            collectionName = COLLECTIONS.PUBLICATIONS_SERVICIOS;
            break;
          case 'productos':
            collectionName = COLLECTIONS.PUBLICATIONS_PRODUCTOS;
            break;
          case 'eventos':
            collectionName = COLLECTIONS.PUBLICATIONS_EVENTOS;
            break;
          case 'negocios':
            collectionName = COLLECTIONS.PUBLICATIONS_NEGOCIOS;
            break;
          case 'comunidad':
            collectionName = COLLECTIONS.PUBLICATIONS_COMUNIDAD;
            break;
          default:
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        }
        
        const collection = db.collection(collectionName);
        const result = await collection.insertOne({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return { id: result.insertedId.toString(), ...data };
      } catch (error) {
        console.error('Error creating publication:', error);
        throw error;
      }
    },
    
    async updatePublication(id: string, category: string, data: Partial<PublicationDocument>) {
      try {
        let collectionName: string;
        
        switch (category) {
          case 'inmuebles':
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
            break;
          case 'vehiculos':
            collectionName = COLLECTIONS.PUBLICATIONS_VEHICULOS;
            break;
          case 'empleos':
            collectionName = COLLECTIONS.PUBLICATIONS_EMPLEOS;
            break;
          case 'servicios':
            collectionName = COLLECTIONS.PUBLICATIONS_SERVICIOS;
            break;
          case 'productos':
            collectionName = COLLECTIONS.PUBLICATIONS_PRODUCTOS;
            break;
          case 'eventos':
            collectionName = COLLECTIONS.PUBLICATIONS_EVENTOS;
            break;
          case 'negocios':
            collectionName = COLLECTIONS.PUBLICATIONS_NEGOCIOS;
            break;
          case 'comunidad':
            collectionName = COLLECTIONS.PUBLICATIONS_COMUNIDAD;
            break;
          default:
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        }
        
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              ...data,
              updatedAt: new Date() 
            } 
          }
        );
        
        return result.modifiedCount > 0;
      } catch (error) {
        console.error('Error updating publication:', error);
        return false;
      }
    },
    
    async deletePublication(id: string, category: string) {
      try {
        let collectionName: string;
        
        switch (category) {
          case 'inmuebles':
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
            break;
          case 'vehiculos':
            collectionName = COLLECTIONS.PUBLICATIONS_VEHICULOS;
            break;
          case 'empleos':
            collectionName = COLLECTIONS.PUBLICATIONS_EMPLEOS;
            break;
          case 'servicios':
            collectionName = COLLECTIONS.PUBLICATIONS_SERVICIOS;
            break;
          case 'productos':
            collectionName = COLLECTIONS.PUBLICATIONS_PRODUCTOS;
            break;
          case 'eventos':
            collectionName = COLLECTIONS.PUBLICATIONS_EVENTOS;
            break;
          case 'negocios':
            collectionName = COLLECTIONS.PUBLICATIONS_NEGOCIOS;
            break;
          case 'comunidad':
            collectionName = COLLECTIONS.PUBLICATIONS_COMUNIDAD;
            break;
          default:
            collectionName = COLLECTIONS.PUBLICATIONS_INMUEBLES;
        }
        
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Error deleting publication:', error);
        return false;
      }
    }
  };
} 