/**
 * Browser-compatible MongoDB adapter
 * This is a special version of the MongoDB client that works in browser environments
 * by providing simple wrappers that call API endpoints instead of direct MongoDB connections.
 */

interface MongoFetchOptions extends RequestInit {
  queryParams?: Record<string, string>;
}

/**
 * Safely fetch data from our MongoDB API routes
 */
export const mongoFetch = async (endpoint: string, options: MongoFetchOptions = {}) => {
  try {
    const { queryParams, ...fetchOptions } = options;
    
    // Add query parameters if provided
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    
    // Set default headers if not provided
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('MongoDB API fetch error:', error);
    throw error;
  }
};

/**
 * Browser-compatible MongoDB client
 * This client provides methods that simulate MongoDB operations but use the fetch API
 */
export const browserMongoClient = {
  // Find documents
  find: async (collection: string, query: any = {}) => {
    return mongoFetch(`/api/mongodb/${collection}/find`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
  
  // Find a single document
  findOne: async (collection: string, query: any = {}) => {
    return mongoFetch(`/api/mongodb/${collection}/findOne`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
  
  // Insert a document
  insertOne: async (collection: string, document: any) => {
    return mongoFetch(`/api/mongodb/${collection}/insertOne`, {
      method: 'POST',
      body: JSON.stringify({ document }),
    });
  },
  
  // Update a document
  updateOne: async (collection: string, filter: any, update: any) => {
    return mongoFetch(`/api/mongodb/${collection}/updateOne`, {
      method: 'POST',
      body: JSON.stringify({ filter, update }),
    });
  },
  
  // Delete a document
  deleteOne: async (collection: string, filter: any) => {
    return mongoFetch(`/api/mongodb/${collection}/deleteOne`, {
      method: 'DELETE',
      body: JSON.stringify({ filter }),
    });
  },
};

// Export a dummy MongoDB client for browser environments
export default async function getMongoClient() {
  return {
    db: (dbName: string) => ({
      collection: (collectionName: string) => ({
        find: (query: any = {}) => browserMongoClient.find(collectionName, query),
        findOne: (query: any = {}) => browserMongoClient.findOne(collectionName, query),
        insertOne: (doc: any) => browserMongoClient.insertOne(collectionName, doc),
        updateOne: (filter: any, update: any) => browserMongoClient.updateOne(collectionName, filter, update),
        deleteOne: (filter: any) => browserMongoClient.deleteOne(collectionName, filter),
      }),
    }),
  };
} 