/**
 * Browser-compatible MongoDB client
 * 
 * This file contains a lightweight browser-compatible version of the MongoDB client
 * that uses fetch to communicate with the server via API endpoints.
 */

// Base API URL for MongoDB data
const API_BASE = '/api/mongodb';

/**
 * Browser MongoDB Client Factory
 * Returns a fake MongoDB client that works in the browser
 */
export default function getBrowserMongoClient() {
  return {
    db: (dbName: string) => ({
      collection: (collectionName: string) => ({
        // Implement only the methods we need for the browser
        find: async (query = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/find`, {
            method: 'POST',
            body: JSON.stringify({ query })
          });
          return {
            toArray: async () => response.data || []
          };
        },
        findOne: async (query = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/findOne`, {
            method: 'POST',
            body: JSON.stringify({ query })
          });
          return response.data;
        },
        insertOne: async (document = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/insertOne`, {
            method: 'POST',
            body: JSON.stringify({ document })
          });
          return response.data;
        },
        updateOne: async (filter = {}, update = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/updateOne`, {
            method: 'POST',
            body: JSON.stringify({ filter, update })
          });
          return response.data;
        },
        deleteOne: async (filter = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/deleteOne`, {
            method: 'POST',
            body: JSON.stringify({ filter })
          });
          return response.data;
        },
        countDocuments: async (filter = {}) => {
          const response = await mongoFetch(`${API_BASE}/${dbName}/${collectionName}/count`, {
            method: 'POST',
            body: JSON.stringify({ filter })
          });
          return response.data?.count || 0;
        }
      })
    })
  };
}

/**
 * Helper function to make API requests to the MongoDB API endpoints
 */
export async function mongoFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`MongoDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('MongoDB fetch error:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
} 