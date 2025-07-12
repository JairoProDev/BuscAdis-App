// Tipos para servicios y utilidades
import type { PublicationData, SearchRequest, SearchResponse, ValidationResult } from './api';

// Tipos para servicios de API
export interface ApiServiceConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Tipos para servicios de búsqueda
export interface SearchServiceConfig {
  maxResults: number;
  defaultLimit: number;
  cacheTimeout: number;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  condition?: string;
  [key: string]: unknown;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: SearchFilters;
}

// Tipos para servicios de publicaciones
export interface PublicationServiceConfig {
  maxImages: number;
  maxFileSize: number;
  allowedTypes: string[];
}

export interface PublicationCreateData {
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  subSubcategorySlug?: string;
  amount?: number;
  currency?: 'PEN' | 'USD';
  negotiable?: boolean;
  location: {
    province: string;
    district?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phones: string[];
    email?: string;
    name?: string;
  };
  images: string[];
  attributes?: Record<string, unknown>;
}

export interface PublicationUpdateData extends Partial<PublicationCreateData> {
  id: string;
}

// Tipos para servicios de autenticación
export interface AuthServiceConfig {
  tokenKey: string;
  refreshTokenKey: string;
  tokenExpiry: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Tipos para servicios de imágenes
export interface ImageServiceConfig {
  maxSize: number;
  allowedTypes: string[];
  quality: number;
  resizeOptions: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
}

export interface ImageUploadOptions {
  folder?: string;
  tags?: string[];
  publicId?: string;
  transformation?: Record<string, unknown>;
}

export interface ImageUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

// Tipos para servicios de validación
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// Tipos para servicios de caché
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}

// Tipos para servicios de logging
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destination: 'console' | 'file' | 'remote';
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

// Tipos para servicios de notificaciones
export interface NotificationConfig {
  types: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  templates: Record<string, string>;
}

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipient: string;
  template?: string;
  data?: Record<string, unknown>;
}

// Tipos para servicios de analytics
export interface AnalyticsConfig {
  enabled: boolean;
  trackingId: string;
  events: string[];
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

// Tipos para servicios de geolocalización
export interface GeolocationConfig {
  apiKey: string;
  provider: 'google' | 'here' | 'openstreetmap';
  cacheTimeout: number;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

// Tipos para servicios de paginación
export interface PaginationConfig {
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationParams;
  hasMore: boolean;
}

// Tipos para servicios de filtros
export interface FilterConfig {
  operators: string[];
  defaultOperator: string;
  caseSensitive: boolean;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: unknown;
}

export interface FilterGroup {
  operator: 'and' | 'or';
  conditions: (FilterCondition | FilterGroup)[];
}

// Tipos para servicios de ordenamiento
export interface SortConfig {
  defaultField: string;
  defaultOrder: 'asc' | 'desc';
  allowedFields: string[];
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

// Tipos para servicios de exportación
export interface ExportConfig {
  formats: ('csv' | 'json' | 'xlsx')[];
  maxRecords: number;
  includeHeaders: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  filters?: FilterGroup;
  sort?: SortOption[];
}

// Tipos para servicios de importación
export interface ImportConfig {
  maxFileSize: number;
  allowedFormats: string[];
  batchSize: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

// Tipos para servicios de backup
export interface BackupConfig {
  schedule: string;
  retention: number;
  compression: boolean;
  encryption: boolean;
}

export interface BackupResult {
  id: string;
  timestamp: Date;
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
}

// Tipos para servicios de monitoreo
export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  metrics: string[];
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Tipos para servicios de rate limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Tipos para servicios de websockets
export interface WebSocketConfig {
  port: number;
  path: string;
  heartbeat: number;
}

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: Date;
  userId?: string;
}

// Tipos para servicios de cola de tareas
export interface QueueConfig {
  name: string;
  concurrency: number;
  retries: number;
  timeout: number;
}

export interface QueueJob {
  id: string;
  name: string;
  data: unknown;
  priority: number;
  delay?: number;
  attempts: number;
  maxAttempts: number;
}

// Tipos para servicios de encriptación
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  saltRounds: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  algorithm: string;
}

// Tipos para servicios de compresión
export interface CompressionConfig {
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  threshold: number;
}

// Tipos para servicios de internacionalización
export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
}

export interface TranslationData {
  key: string;
  locale: string;
  value: string;
  context?: Record<string, unknown>;
}

// Tipos para servicios de temas
export interface ThemeConfig {
  defaultTheme: string;
  themes: string[];
  persist: boolean;
}

export interface ThemeData {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}

// Tipos para servicios de accesibilidad
export interface AccessibilityConfig {
  enabled: boolean;
  features: string[];
  compliance: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA';
}

// Tipos para servicios de SEO
export interface SEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  siteUrl: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  type: string;
}

// Tipos para servicios de rendimiento
export interface PerformanceConfig {
  enabled: boolean;
  metrics: string[];
  threshold: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

// Tipos para servicios de seguridad
export interface SecurityConfig {
  enabled: boolean;
  features: string[];
  headers: Record<string, string>;
}

export interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
}

// Tipos para servicios de testing
export interface TestConfig {
  framework: string;
  coverage: number;
  timeout: number;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

// Tipos para servicios de documentación
export interface DocumentationConfig {
  format: 'markdown' | 'html' | 'pdf';
  output: string;
  template: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: Record<string, unknown>;
  responses: Record<string, unknown>;
}

// Tipos para servicios de migración
export interface MigrationConfig {
  version: string;
  rollback: boolean;
  dryRun: boolean;
}

export interface MigrationResult {
  version: string;
  status: 'success' | 'failed' | 'rolled_back';
  duration: number;
  changes: string[];
}

// Tipos para servicios de auditoría
export interface AuditConfig {
  enabled: boolean;
  events: string[];
  retention: number;
}

export interface AuditEvent {
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

// Tipos para servicios de webhooks
export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  timeout: number;
}

export interface WebhookPayload {
  event: string;
  data: unknown;
  timestamp: Date;
  signature: string;
}

// Tipos para servicios de plugins
export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  hooks: Record<string, unknown>;
}

// Tipos para servicios de métricas
export interface MetricsConfig {
  enabled: boolean;
  interval: number;
  storage: 'memory' | 'database' | 'external';
}

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
}

// Tipos para servicios de alertas
export interface AlertConfig {
  enabled: boolean;
  channels: string[];
  thresholds: Record<string, number>;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
} 