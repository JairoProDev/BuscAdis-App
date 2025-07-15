import mongoose from "mongoose";
import { Logger } from '@/services/logging.service';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

// Global cache for connection reuse
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection states mapping for better logging
const CONNECTION_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
};

async function dbConnect() {
  // Use cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    Logger.info("MongoDB: Creating new connection...");

    mongoose.connection.on("connected", () => {
      Logger.info("MongoDB: Connection established successfully");
    });

    mongoose.connection.on("error", (err) => {
      Logger.error("MongoDB: Connection error", { error: err });
    });

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        Logger.info("MongoDB: Initial connection successful");
        return mongoose;
      })
      .catch((error) => {
        Logger.error("MongoDB: Initial connection error", { error });
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Browser-compatible fetch wrapper for MongoDB operations
export const mongoFetch = async (endpoint, options = {}) => {
  try {
    const { queryParams, ...fetchOptions } = options;
    
    // Add query parameters if provided
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    
    // Set default headers
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
    Logger.error('MongoDB API fetch error', { error });
    throw error;
  }
};

export default dbConnect; 