import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://buscadiss:UQA8DlAqm6N7DDNx@cluster0.4qbi1hu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable"
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
  const logConnectionState = () => {
    const state = mongoose.connection.readyState;
    console.log(
      `[MongoDB] Connection state: ${CONNECTION_STATES[state]} (${state})`
    );
  };

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

    console.log("[MongoDB] Creating new connection...");

    mongoose.connection.on("connected", () => {
      console.log("[MongoDB] Connection established successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err);
    });

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("[MongoDB] Initial connection successful");
        return mongoose;
      })
      .catch((error) => {
        console.error("[MongoDB] Initial connection error:", error);
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
    console.error('MongoDB API fetch error:', error);
    throw error;
  }
};

export default dbConnect; 