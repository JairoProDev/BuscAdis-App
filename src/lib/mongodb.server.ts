'use server';

import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || 'buscadis';

// Debug flag
const DEBUG = true;

// Create connection cache
let clientPromise: Promise<MongoClient> | null = null;
let client: MongoClient | null = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Enhanced logging
function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[MongoDB Debug] ${message}`, data ? data : '');
  }
}

function logError(message: string, error: any) {
  console.error(`[MongoDB Error] ${message}:`, error);
  
  // Log detailed information about the error
  if (error) {
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.result) {
      console.error('Error result:', error.result);
    }
  }
}

/**
 * Get or create MongoDB client connection with retries
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (client && client.topology && client.topology.isConnected()) {
    logDebug('Reusing existing MongoDB connection');
    return client;
  }
  
  connectionAttempts++;
  logDebug(`Creating new MongoDB connection (attempt ${connectionAttempts})`);

  try {
    // Close existing client if it exists but is disconnected
    if (client) {
      try {
        logDebug('Closing existing disconnected client');
        await client.close(true);
      } catch (err) {
        logError('Error closing existing client', err);
      }
    }
    
    // Create a new MongoClient
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 20,
      minPoolSize: 5,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    // Connect only once
    if (!clientPromise) {
      logDebug('Initializing MongoDB connection');
      clientPromise = client.connect()
        .then((connectedClient) => {
          logDebug('MongoDB connected successfully');
          // Ping database to check connection
          return connectedClient.db("admin").command({ ping: 1 })
            .then(() => {
              logDebug('MongoDB ping successful');
              return connectedClient;
            });
        })
        .catch(err => {
          logError('MongoDB connection error', err);
          client = null;
          clientPromise = null;
          throw err;
        });
    }
    
    try {
      // Wait for connection to be established
      await clientPromise;
      
      // Verify connection is working
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      logDebug(`MongoDB connected to ${dbName} with ${collections.length} collections`);
      
      // Reset connection attempts on successful connection
      connectionAttempts = 0;
      
      return client;
    } catch (error) {
      logError('Error connecting to MongoDB', error);
      
      // Reset client and promise for retry
      client = null;
      clientPromise = null;
      
      if (connectionAttempts < MAX_RETRIES) {
        logDebug(`Retrying connection (${connectionAttempts}/${MAX_RETRIES})`);
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, connectionAttempts) * 1000));
        return getMongoClient();
      }
      
      throw error;
    }
  } catch (error) {
    logError('Fatal MongoDB connection error', error);
    throw new Error(`Could not connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Server-side function to connect to MongoDB and perform a query with better error handling
 */
export async function mongoDbQuery<T>(collection: string, query: any, options: any = {}): Promise<T[]> {
  let mongoClient: MongoClient | null = null;
  
  try {
    logDebug(`Querying collection '${collection}' with:`, {query, options});
    
    // Get MongoDB client
    mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    
    // Check if collection exists
    const collections = await db.listCollections({name: collection}).toArray();
    if (collections.length === 0) {
      logDebug(`Collection '${collection}' does not exist, returning empty result`);
      return [] as T[];
    }
    
    // Execute query
    const result = await db.collection(collection).find(query, options).toArray();
    logDebug(`Query returned ${result.length} documents`);
    
    return JSON.parse(JSON.stringify(result)) as T[];
  } catch (error) {
    logError(`Error executing MongoDB query on collection '${collection}'`, error);
    throw new Error(`Database query error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Server-side function to get a single document by ID with better error handling
 */
export async function mongoDbGetById<T>(collection: string, id: string): Promise<T | null> {
  try {
    logDebug(`Getting document with id '${id}' from collection '${collection}'`);
    
    const client = await getMongoClient();
    const db = client.db(dbName);
    
    // Check if collection exists
    const collections = await db.listCollections({name: collection}).toArray();
    if (collections.length === 0) {
      logDebug(`Collection '${collection}' does not exist, returning null`);
      return null;
    }
    
    const result = await db.collection(collection).findOne({ id });
    logDebug(`Document ${result ? 'found' : 'not found'}`);
    
    return result ? JSON.parse(JSON.stringify(result)) as T : null;
  } catch (error) {
    logError(`Error getting document from collection '${collection}'`, error);
    throw new Error(`Database query error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Server-side function to insert a document with better error handling
 */
export async function mongoDbInsert<T>(collection: string, document: T): Promise<any> {
  try {
    logDebug(`Inserting document into collection '${collection}'`);
    
    const client = await getMongoClient();
    const db = client.db(dbName);
    
    // Create collection if it doesn't exist
    const collections = await db.listCollections({name: collection}).toArray();
    if (collections.length === 0) {
      logDebug(`Creating collection '${collection}'`);
      await db.createCollection(collection);
    }
    
    const result = await db.collection(collection).insertOne(document);
    logDebug(`Document inserted successfully with ID: ${result.insertedId}`);
    
    return result;
  } catch (error) {
    logError(`Error inserting document to collection '${collection}'`, error);
    throw new Error(`Database insert error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Server-side function to update a document with better error handling
 */
export async function mongoDbUpdate<T>(collection: string, id: string, update: Partial<T>): Promise<any> {
  try {
    logDebug(`Updating document with id '${id}' in collection '${collection}'`);
    
    const client = await getMongoClient();
    const db = client.db(dbName);
    
    // Check if collection exists
    const collections = await db.listCollections({name: collection}).toArray();
    if (collections.length === 0) {
      logDebug(`Collection '${collection}' does not exist, no update performed`);
      return { modifiedCount: 0, acknowledged: true };
    }
    
    const result = await db.collection(collection).updateOne({ id }, { $set: update });
    logDebug(`Document update: ${result.modifiedCount} documents modified`);
    
    return result;
  } catch (error) {
    logError(`Error updating document in collection '${collection}'`, error);
    throw new Error(`Database update error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Server-side function to delete a document with better error handling
 */
export async function mongoDbDelete(collection: string, id: string): Promise<any> {
  try {
    logDebug(`Deleting document with id '${id}' from collection '${collection}'`);
    
    const client = await getMongoClient();
    const db = client.db(dbName);
    
    // Check if collection exists
    const collections = await db.listCollections({name: collection}).toArray();
    if (collections.length === 0) {
      logDebug(`Collection '${collection}' does not exist, no deletion performed`);
      return { deletedCount: 0, acknowledged: true };
    }
    
    const result = await db.collection(collection).deleteOne({ id });
    logDebug(`Document deletion: ${result.deletedCount} documents deleted`);
    
    return result;
  } catch (error) {
    logError(`Error deleting document from collection '${collection}'`, error);
    throw new Error(`Database delete error: ${error instanceof Error ? error.message : String(error)}`);
  }
} 