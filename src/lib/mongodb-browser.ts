/**
 * Browser-compatible MongoDB client
 * 
 * This file contains a lightweight browser-compatible version of the MongoDB client
 * that uses fetch to communicate with the server via API endpoints.
 */

// Debug flag to control logging
const DEBUG = true;

// Helper functions for logging
function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[MongoDB Browser] ${message}`, data ? data : '');
  }
}

function logError(message: string, error: any) {
  console.error(`[MongoDB Browser Error] ${message}:`, error);
  if (error?.stack) {
    console.error('Stack:', error.stack);
  }
}

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
    
    logDebug(`Making request to ${url}`, { method: fetchOptions.method || 'GET', hasBody: !!fetchOptions.body });
    
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
          logDebug(`Retry ${currentRetry}/${retries} for ${url}`);
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
          logError(`API request failed (${response.status}):`, {
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
        logDebug(`Request to ${url} succeeded`, { dataSize: JSON.stringify(data).length });
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error, retry
          lastError = error;
          logError(`Network error on attempt ${currentRetry}`, error);
          currentRetry++;
          continue;
        }
        
        // For other errors, only retry if we haven't exceeded the limit
        if (currentRetry < retries) {
          lastError = error;
          logError(`Error on attempt ${currentRetry}`, error);
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
    logError('API request error after all retries', error);
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
        logDebug(`Finding documents in ${collection}`, { query, options });
        
        const response = await mongoFetch(`/api/${collection}`, {
          method: 'GET',
          queryParams: {
            ...query,
            ...options,
          },
        });
        
        if (!response.publications && response.error) {
          logError(`Error finding documents in ${collection}`, response.error);
          throw new Error(response.errorFriendly || response.error);
        }
        
        return response;
      } catch (error) {
        logError(`Error in browser mongodb.find for ${collection}`, error);
        
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
        logDebug(`Finding document ${id} in ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}/${id}`);
        return response;
      } catch (error) {
        logError(`Error in browser mongodb.findOne for ${collection}/${id}`, error);
        
        // Return fallback error response
        return { 
          error: error instanceof Error ? error.message : 'Unknown error',
          errorFriendly: 'No pudimos encontrar el documento solicitado. Por favor, verifica el ID e intenta nuevamente.'
        };
      }
    },
    
    // Insert a new document
    insertOne: async (collection: string, document: any) => {
      try {
        logDebug(`Inserting document into ${collection}`, document);
        
        const response = await mongoFetch(`/api/${collection}`, {
          method: 'POST',
          body: JSON.stringify(document),
        });
        
        logDebug(`Insert into ${collection} successful`, response);
        return response;
      } catch (error) {
        logError(`Error in browser mongodb.insertOne for ${collection}`, error);
        throw error;
      }
    },
    
    // Update an existing document
    updateOne: async (collection: string, id: string, update: any) => {
      try {
        logDebug(`Updating document ${id} in ${collection}`, update);
        
        const response = await mongoFetch(`/api/${collection}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(update),
        });
        
        logDebug(`Update of ${id} in ${collection} successful`, response);
        return response;
      } catch (error) {
        logError(`Error in browser mongodb.updateOne for ${collection}/${id}`, error);
        throw error;
      }
    },
    
    // Delete a document
    deleteOne: async (collection: string, id: string) => {
      try {
        logDebug(`Deleting document ${id} from ${collection}`);
        
        const response = await mongoFetch(`/api/${collection}/${id}`, {
          method: 'DELETE',
        });
        
        logDebug(`Deletion of ${id} from ${collection} successful`, response);
        return response;
      } catch (error) {
        logError(`Error in browser mongodb.deleteOne for ${collection}/${id}`, error);
        throw error;
      }
    }
  };
} 