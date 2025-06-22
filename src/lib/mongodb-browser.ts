/**
 * Browser-compatible MongoDB client
 * 
 * This file contains a lightweight browser-compatible version of the MongoDB client
 * that uses fetch to communicate with the server via API endpoints.
 */

import { Logger } from '@/services/logging.service';

// Maximum retries for fetch operations
const MAX_RETRIES = 2;

interface MongoFetchOptions {
  method?: string;
  body?: string | FormData;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  retries?: number;
}

// Helper function to make API requests with better error handling
export const mongoFetch = async (endpoint: string, options: MongoFetchOptions = {}): Promise<any> => {
  try {
    const { queryParams, retries = MAX_RETRIES, ...fetchOptions } = options;
    
    // Build URL with query parameters if provided
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    
    Logger.debug(`Making request to ${url}`, { method: fetchOptions.method || 'GET', hasBody: !!fetchOptions.body });
    
    // Set default headers for JSON
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    
    // Add retry logic
    let currentRetry = 0;
    let lastError = null;
    
    while (currentRetry <= retries) {
      try {
        if (currentRetry > 0) {
          Logger.debug(`Retry ${currentRetry}/${retries} for ${url}`);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetry) * 500));
        }
        
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorData = null;
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            // Not JSON, keep as text
          }
          
          const error = new Error(`API error: ${response.status} ${response.statusText}`);
          // @ts-ignore - add extra properties
          error.status = response.status;
          // @ts-ignore
          error.statusText = response.statusText;
          // @ts-ignore
          error.data = errorData;
          // @ts-ignore
          error.originalText = errorText;
          
          // Log detailed error info
          Logger.error(`API request failed (${response.status})`, {
            url,
            status: response.status,
            statusText: response.statusText,
            errorData: errorData || errorText
          });
          
          // For server errors (5xx), retry; for client errors (4xx), fail immediately
          if (response.status >= 500) {
            lastError = error;
            currentRetry++;
            continue;
          }
          
          throw error;
        }
        
        // Parse JSON response
        const data = await response.json();
        Logger.debug(`Request to ${url} succeeded`, { dataSize: JSON.stringify(data).length });
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error, retry
          lastError = error;
          Logger.error(`Network error on attempt ${currentRetry}`, { error });
          currentRetry++;
          continue;
        }
        
        // For other errors, only retry if we haven't exceeded the limit
        if (currentRetry < retries) {
          lastError = error;
          Logger.error(`Error on attempt ${currentRetry}`, { error });
          currentRetry++;
          continue;
        }
        
        // We've exhausted retries, throw the error
        throw error;
      }
    }
    
    // If we get here, we've exhausted retries without success
    throw lastError || new Error(`Failed after ${retries} retries`);
  } catch (error) {
    Logger.error('API request error after all retries', { error });
    throw error;
  }
};

/**
 * Get a MongoDB client configured for browser use
 */
export const getBrowserMongoClient = () => {
  return {
    // Find documents in a collection
    find: async (collection: string, query: any = {}, options: any = {}) => {
      try {
        Logger.debug(`Finding documents in ${collection}`, { query, options });
        
        const response = await mongoFetch(`/api/${collection}`, {
          method: 'GET',
          queryParams: {
            ...query,
            ...options,
          },
        });
        
        if (!response.publications && response.error) {
          Logger.error(`Error finding documents in ${collection}`, { error: response.error });
          throw new Error(response.errorFriendly || response.error);
        }
        
        return response;
      } catch (error) {
        Logger.error(`Error in browser mongodb.find for ${collection}`, { error });
        
        // Return empty result set instead of throwing to prevent UI breakage
        return { 
          publications: [], 
          total: 0, 
          pages: 0, 
          page: 1, 
          error: error instanceof Error ? error.message : 'Unknown error',
          errorFriendly: 'No pudimos cargar los resultados en este momento. Por favor, intenta más tarde.' 
        };
      }
    },
    
    // Get a single document by ID
    findOne: async (collection: string, id: string) => {
      try {
        Logger.debug(`Finding document ${id} in ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}/${id}`);
        return response;
      } catch (error) {
        Logger.error(`Error finding document ${id} in ${collection}`, { error });
        return null;
      }
    },
    
    // Insert a document
    insertOne: async (collection: string, document: any) => {
      try {
        Logger.debug(`Inserting document into ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}`, {
          method: 'POST',
          body: JSON.stringify(document),
        });
        
        return response;
      } catch (error) {
        Logger.error(`Error inserting document into ${collection}`, { error });
        throw error;
      }
    },
    
    // Update a document
    updateOne: async (collection: string, id: string, update: any) => {
      try {
        Logger.debug(`Updating document ${id} in ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(update),
        });
        
        return response;
      } catch (error) {
        Logger.error(`Error updating document ${id} in ${collection}`, { error });
        throw error;
      }
    },
    
    // Delete a document
    deleteOne: async (collection: string, id: string) => {
      try {
        Logger.debug(`Deleting document ${id} from ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}/${id}`, {
          method: 'DELETE',
        });
        
        return response;
      } catch (error) {
        Logger.error(`Error deleting document ${id} from ${collection}`, { error });
        throw error;
      }
    }
  };
}; 