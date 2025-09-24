// src/services/auth.service.server.ts
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/types/user';
import { Publication } from '@/types/publication';
import { ObjectId } from 'mongodb';

// This file contains functions that are ONLY meant to be run on the server.

export const getUserPublicationsServer = async (userId: string) => {
  if (!userId) {
    return [];
  }

  try {
    const client = await connectToDatabase;
    const db = client.db();
    const publications = await db.collection<Publication>('publications')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    return publications;
  } catch (error) {
    console.error('Error fetching user publications:', error);
    throw new Error('Could not fetch publications.');
  }
};

export const getUserDataServer = async (userId: string): Promise<User | null> => {
  if (!userId) return null;

  try {
    const client = await connectToDatabase;
    const db = client.db();
    const user = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
