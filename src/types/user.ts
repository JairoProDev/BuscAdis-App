// src/types/user.ts

import { ObjectId } from 'mongodb';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface User {
  _id: ObjectId;
  phone: string;
  dni: string;
  email?: string;
  profile?: UserProfile;
  roles: ('user' | 'admin' | 'moderator')[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
