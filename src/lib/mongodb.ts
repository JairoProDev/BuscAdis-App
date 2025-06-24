import { getServerMongoClient } from './mongodb-server';
import { MongoClient } from 'mongodb';

// For backward compatibility with existing imports
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = getServerMongoClient().then(client => {
      // Return a mock MongoClient for compatibility
      return {
        db: () => ({
          collection: () => ({
            find: () => ({ toArray: () => Promise.resolve([]) }),
            findOne: () => Promise.resolve(null),
            insertOne: () => Promise.resolve({ insertedId: null }),
            updateOne: () => Promise.resolve({ matchedCount: 0 }),
            deleteOne: () => Promise.resolve({ deletedCount: 0 }),
            countDocuments: () => Promise.resolve(0)
          })
        })
      } as any;
    });
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = getServerMongoClient().then(client => {
    return {
      db: () => ({
        collection: () => ({
          find: () => ({ toArray: () => Promise.resolve([]) }),
          findOne: () => Promise.resolve(null),
          insertOne: () => Promise.resolve({ insertedId: null }),
          updateOne: () => Promise.resolve({ matchedCount: 0 }),
          deleteOne: () => Promise.resolve({ deletedCount: 0 }),
          countDocuments: () => Promise.resolve(0)
        })
      })
    } as any;
  });
}

export default clientPromise; 