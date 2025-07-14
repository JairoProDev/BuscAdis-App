// Tipos para APIs y servicios
import { Db, Collection, Document } from 'mongodb';

// Tipos base para respuestas de API
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Tipos para MongoDB
export interface MongoConnection {
  client: import('mongodb').MongoClient;
  db: Db;
}

export interface CachedDatabase {
  client: import('mongodb').MongoClient | null;
  db: Db | null;
}

// Tipos para analytics
export interface SearchAnalytics {
  query: string;
  filters: Record<string, unknown>;
  userId: string | null;
  sessionId: string | null;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  count: number;
}

export interface TrendingSearch {
  query: string;
  originalQuery: string;
  count: number;
  lastSearched: Date;
  growth: string;
  trend: 'up' | 'down' | 'stable';
}

// Tipos para favoritos
export interface FavoriteRequest {
  publicationId: string;
  userId?: string;
}

export interface FavoriteResponse {
  message: string;
  publicationId: string;
}

export interface FavoritesListResponse {
  favorites: string[];
}

// Tipos para geocoding
export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface ReverseGeocodingResult {
  results: GeocodingResult[];
  status: string;
}

// Tipos para publicaciones
export interface PublicationSearchResult {
  _id: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface PublicationFilters {
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  location?: string;
  condition?: string;
  [key: string]: unknown;
}

// Tipos para uploads
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Tipos para usuarios
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}

// Tipos para formularios
export interface FormData {
  [key: string]: string | number | boolean | File[] | unknown;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para búsqueda
export interface SearchRequest {
  query: string;
  filters?: PublicationFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  results: PublicationSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  suggestions?: SearchSuggestion[];
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Tipos para mensajes
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  read: boolean;
}

// Tipos para logs
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// Tipos para achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Tipos para AI
export interface AIRequest {
  prompt: string;
  context?: Record<string, unknown>;
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  };
}

export interface AIResponse {
  text: string;
  confidence: number;
  tokens: number;
  model: string;
}

// Tipos para imágenes
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  url: string;
  alt?: string;
}

// Tipos para location
export interface LocationData {
  province: string;
  district?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  referencePoint?: string;
}

// Tipos para contact
export interface ContactInfo {
  phones: string[];
  email?: string;
  name?: string;
  website?: string;
}

// Tipos para price
export interface PriceInfo {
  amount: number | null;
  currency: 'PEN' | 'USD' | null;
  negotiable: boolean | null;
  priceType?: 'fixed' | 'range' | 'negotiable';
}

// Tipos para attributes
export interface PublicationAttributes {
  [key: string]: string | number | boolean | string[] | null;
}

// Tipos para publicación completa
export interface PublicationData {
  id?: string;
  title: string;
  description: string;
  images: string[];
  categorySlug: string;
  subcategorySlug: string;
  subSubcategorySlug?: string;
  location: LocationData;
  contact: ContactInfo;
  price: PriceInfo;
  attributes?: PublicationAttributes;
  status?: 'pending' | 'active' | 'inactive' | 'rejected';
  premium?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

// Tipos para colecciones de MongoDB
export interface MongoCollection<T extends Document = Document> {
  find(filter?: Record<string, unknown>): {
    limit(limit: number): {
      toArray(): Promise<T[]>;
    };
  };
  findOne(filter: Record<string, unknown>): Promise<T | null>;
  insertOne(doc: T): Promise<{ insertedId: string }>;
  updateOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<{ modifiedCount: number }>;
  deleteOne(filter: Record<string, unknown>): Promise<{ deletedCount: number }>;
  aggregate(pipeline: Record<string, unknown>[]): {
    toArray(): Promise<T[]>;
  };
}

// Tipos para headers de request
export interface RequestHeaders {
  'user-agent'?: string;
  'x-forwarded-for'?: string;
  'x-real-ip'?: string;
  authorization?: string;
  'content-type'?: string;
  [key: string]: string | undefined;
}

// Tipos para request body
export interface RequestBody {
  [key: string]: unknown;
}

// Tipos para URL search params
export interface URLSearchParams {
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  delete(name: string): void;
  toString(): string;
}

// Tipos para response headers
export interface ResponseHeaders {
  'content-type': string;
  'cache-control'?: string;
  'access-control-allow-origin'?: string;
  [key: string]: string | undefined;
}

// Tipos para Next.js Request/Response
export interface NextRequest {
  url: string;
  method: string;
  headers: RequestHeaders;
  json(): Promise<RequestBody>;
  text(): Promise<string>;
}

export interface NextResponse {
  json(data: unknown, options?: { status?: number; headers?: ResponseHeaders }): Response;
  redirect(url: string, status?: number): Response;
}

// Tipos para errores
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Tipos para configuración
export interface AppConfig {
  mongodb: {
    uri: string;
    db: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };
}

// Tipos para cache
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStore {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
}

// Tipos para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
  hasMore: boolean;
}

// Tipos para filtros dinámicos
export interface DynamicFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: unknown;
}

export interface FilterGroup {
  operator: 'and' | 'or';
  filters: (DynamicFilter | FilterGroup)[];
}

// Tipos para sorting
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

// Tipos para aggregation
export interface AggregationStage {
  $match?: Record<string, unknown>;
  $group?: Record<string, unknown>;
  $sort?: Record<string, 1 | -1>;
  $limit?: number;
  $skip?: number;
  $project?: Record<string, unknown>;
  $lookup?: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  };
}

// Tipos para estadísticas
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  rejected: number;
  premium: number;
}

// Tipos para métricas
export interface Metric {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Tipos para eventos
export interface AppEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// Tipos para webhooks
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: Date;
  signature?: string;
}

// Tipos para rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Tipos para autenticación
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

// Tipos para sesiones
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  data: Record<string, unknown>;
}

// Tipos para auditoría
export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

// Re-export PublicationDocument from database architecture
export type { PublicationDocument } from '@/data/database-architecture'; 