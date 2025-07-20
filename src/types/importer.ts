/**
 * Types for publication importers
 */

export interface PublicationImporterConfig {
  sourceFile: string;
  sourceFormat: 'json' | 'csv' | 'txt';
  batchSize?: number;
  validateData?: boolean;
  skipDuplicates?: boolean;
  categoryMapping?: Record<string, string>;
  locationMapping?: Record<string, string>;
  customValidators?: Array<(data: unknown) => boolean>;
  onProgress?: (progress: number, total: number) => void;
  onError?: (error: Error, data: unknown) => void;
  // Additional properties for BulkPublicationImporter compatibility
  mapping?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  processing?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  results: Array<{
    success: boolean;
    publication?: unknown;
    error?: string;
  }>;
}

export interface BulkPublicationImporter {
  import(config: PublicationImporterConfig): Promise<ImportResult>;
  validate(config: PublicationImporterConfig): Promise<{ isValid: boolean; errors: string[] }>;
} 