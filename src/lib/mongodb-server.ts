/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient } from 'mongodb';
import { MongoClientInterface } from './mongodb';
import { COLLECTIONS } from './mongodb-shared';

// MongoDB connection string should be in environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'test';

// Create cached connection variable
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

// Create a new MongoDB client with connection pooling
export default async function getServerMongoClient(): Promise<MongoClientInterface> {
  // If we already have a connection, use it
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      // Connection pooling options
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    // Connect to the database
    await cachedClient.connect();
    cachedDb = cachedClient.db(MONGODB_DB);
  }

  // Return an object that implements MongoClientInterface
  return {
    fetchPublications: async (options = {}) => {
      const { 
        category, 
        query, 
        minPrice, 
        maxPrice, 
        location, 
        sortBy = 'recent',
        page = 1, 
        limit = 12 
      } = options;
      
      // Build MongoDB query
      const mongoQuery: any = {};
      
      if (category) mongoQuery.category = category;
      
      if (query) {
        mongoQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (location) {
        mongoQuery['location.city'] = { $regex: location, $options: 'i' };
      }
      
      if (minPrice || maxPrice) {
        mongoQuery.price = {};
        if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice);
      }
      
      // Sort options
      const sortOptions: any = {};
      switch (sortBy) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'recent':
        default:
          sortOptions.created_at = -1;
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Use appropriate collection based on category
      const collectionName = category === 'empleos' ? COLLECTIONS.PUBLICATIONS_EMPLEOS :
                            category === 'servicios' ? COLLECTIONS.PUBLICATIONS_SERVICIOS :
                            category === 'vehiculos' ? COLLECTIONS.PUBLICATIONS_VEHICULOS :
                            COLLECTIONS.PUBLICATIONS_INMUEBLES;
                            
      const data = await cachedDb.collection(collectionName).find(mongoQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray();
        
      // Get total count for pagination  
      const totalCount = await cachedDb.collection(collectionName).countDocuments(mongoQuery);
      
      return {
        publications: data,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page
      };
    },
    
    fetchPublicationById: async (id) => {
      // Try to find in each collection since we don't know which one it's in
      const collections = [
        COLLECTIONS.PUBLICATIONS_INMUEBLES,
        COLLECTIONS.PUBLICATIONS_EMPLEOS,
        COLLECTIONS.PUBLICATIONS_SERVICIOS,
        COLLECTIONS.PUBLICATIONS_VEHICULOS
      ];
      
      for (const collection of collections) {
        const result = await cachedDb.collection(collection).findOne({ id });
        if (result) return result;
      }
      
      return null;
    },
    
    fetchPublicationsByUser: async (userId) => {
      // We need to search in all collections
      const inmuebles = await cachedDb.collection(COLLECTIONS.PUBLICATIONS_INMUEBLES).find({ userId }).toArray();
      const empleos = await cachedDb.collection(COLLECTIONS.PUBLICATIONS_EMPLEOS).find({ userId }).toArray();
      const servicios = await cachedDb.collection(COLLECTIONS.PUBLICATIONS_SERVICIOS).find({ userId }).toArray();
      const vehiculos = await cachedDb.collection(COLLECTIONS.PUBLICATIONS_VEHICULOS).find({ userId }).toArray();
      
      // Combine and return all results
      return [...inmuebles, ...empleos, ...servicios, ...vehiculos];
    },
    
    createPublication: async (data) => {
      // Determine collection based on category
      const categorySlug = data.category || 'inmuebles';
      const collectionName = `publications_${categorySlug}`;
      
      const now = new Date();
      const publicationData = {
        ...data,
        id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
        status: 'active',
        created_at: now,
        updated_at: now
      };
      
      // Insert the document
      const result = await cachedDb.collection(collectionName).insertOne(publicationData);
      
      return { 
        success: !!result.acknowledged,
        id: publicationData.id
      };
    },
    
    updatePublication: async (id, data) => {
      // Try to update in each collection since we don't know which one it's in
      const collections = [
        COLLECTIONS.PUBLICATIONS_INMUEBLES,
        COLLECTIONS.PUBLICATIONS_EMPLEOS,
        COLLECTIONS.PUBLICATIONS_SERVICIOS,
        COLLECTIONS.PUBLICATIONS_VEHICULOS
      ];
      
      for (const collection of collections) {
        const result = await cachedDb.collection(collection).updateOne(
          { id },
          { 
            $set: {
              ...data,
              updated_at: new Date()
            } 
          }
        );
        
        if (result.matchedCount > 0) {
          return { success: true, modified: result.modifiedCount > 0 };
        }
      }
      
      return { success: false, error: 'Publication not found' };
    },
    
    deletePublication: async (id) => {
      // Try to delete from each collection since we don't know which one it's in
      const collections = [
        COLLECTIONS.PUBLICATIONS_INMUEBLES,
        COLLECTIONS.PUBLICATIONS_EMPLEOS,
        COLLECTIONS.PUBLICATIONS_SERVICIOS,
        COLLECTIONS.PUBLICATIONS_VEHICULOS
      ];
      
      for (const collection of collections) {
        const result = await cachedDb.collection(collection).deleteOne({ id });
        if (result.deletedCount > 0) {
          return { success: true };
        }
      }
      
      return { success: false, error: 'Publication not found' };
    }
  };
} 