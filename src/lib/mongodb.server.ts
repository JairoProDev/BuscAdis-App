'use server';

import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database Name
const dbName = process.env.MONGODB_DB || 'buscadis';

/**
 * Server-side function to connect to MongoDB and perform a query
 */
export async function mongoDbQuery(collection: string, query: any, options: any = {}) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection(collection).find(query, options).toArray();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Server-side function to get a single document by ID
 */
export async function mongoDbGetById(collection: string, id: string) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection(collection).findOne({ id });
    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Server-side function to insert a document
 */
export async function mongoDbInsert(collection: string, document: any) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection(collection).insertOne(document);
    return result;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Server-side function to update a document
 */
export async function mongoDbUpdate(collection: string, id: string, update: any) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection(collection).updateOne({ id }, { $set: update });
    return result;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Server-side function to delete a document
 */
export async function mongoDbDelete(collection: string, id: string) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection(collection).deleteOne({ id });
    return result;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  } finally {
    await client.close();
  }
} 