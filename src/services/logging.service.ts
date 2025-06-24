// src\services\logging.service.ts
import { toast } from 'react-hot-toast';

/**
 * Professional Logging Service para BuscAdis
 * 
 * Sistema de logging empresarial que reemplaza todos los console.log
 * con un sistema estructurado, filtrable y escalable.
 * 
 * Características:
 * - Niveles de log (debug, info, warn, error)
 * - Contexto estructurado 
 * - Filtrado por ambiente
 * - Integración con servicios externos
 * - Performance tracking
 * - Error aggregation
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  performance?: {
    duration?: number;
    memory?: number;
  };
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  enablePerformance: boolean;
  enableAnalytics: boolean;
  bufferSize: number;
  flushInterval: number; // ms
}

class LoggingService {
  private static instance: LoggingService;
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private performanceMarks: Map<string, number> = new Map();
  
  // Niveles de prioridad para filtrado
  private readonly LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private constructor() {
    this.config = {
      level: this.getEnvironmentLogLevel(),
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.LOGGING_ENDPOINT,
      enablePerformance: true,
      enableAnalytics: true,
      bufferSize: 100,
      flushInterval: 5000
    };

    this.startFlushTimer();
    this.setupErrorHandlers();
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log general information
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log errors
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  /**
   * Log success messages
   */
  success(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
    
    // Show success toast in browser
    if (typeof window !== 'undefined') {
      toast.success(message);
    }
  }

  /**
   * Log performance timing
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.log('info', `Performance: ${operation}`, {
      ...context,
      performance: {
        operation,
        duration,
        memory: this.getMemoryUsage()
      }
    });
  }

  /**
   * Start performance timing
   */
  startTiming(operation: string): void {
    if (this.config.enablePerformance) {
      this.performanceMarks.set(operation, Date.now());
    }
  }

  /**
   * End performance timing and log
   */
  endTiming(operation: string, context?: Record<string, any>): number {
    if (!this.config.enablePerformance) return 0;
    
    const startTime = this.performanceMarks.get(operation);
    if (!startTime) {
      this.warn(`Performance timing not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.performanceMarks.delete(operation);
    
    this.performance(operation, duration, context);
    return duration;
  }

  /**
   * Log API requests
   */
  apiRequest(method: string, url: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    
    this.log(level, `API ${method} ${url}`, {
      ...context,
      api: {
        method,
        url,
        statusCode,
        duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, userId?: string, context?: Record<string, any>): void {
    if (!this.config.enableAnalytics) return;
    
    this.log('info', `User action: ${action}`, {
      ...context,
      user: {
        userId,
        action,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      }
    });
  }

  /**
   * Log search queries for optimization
   */
  searchQuery(query: string, results: number, duration: number, context?: Record<string, any>): void {
    this.log('info', `Search: "${query}"`, {
      ...context,
      search: {
        query,
        results,
        duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log business metrics
   */
  businessMetric(metric: string, value: number, unit?: string, context?: Record<string, any>): void {
    this.log('info', `Metric: ${metric}`, {
      ...context,
      metric: {
        name: metric,
        value,
        unit,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Flush logs immediately
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      if (this.config.enableRemote && this.config.remoteEndpoint) {
        await this.sendToRemote(logsToFlush);
      }
    } catch (error) {
      // Si falla el envío remoto, restaurar los logs en el buffer
      this.buffer.unshift(...logsToFlush);
      console.error('Failed to send logs to remote endpoint:', error);
    }
  }

  /**
   * Update configuration
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.startFlushTimer();
  }

  // Métodos privados

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Filtrar por nivel
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source: this.getCallerInfo(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId()
    };

    // Agregar stack trace para errores
    if (level === 'error') {
      entry.stack = new Error().stack;
    }

    // Log a consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Agregar al buffer para envío remoto
    this.buffer.push(entry);

    // Flush si el buffer está lleno
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    
    const formatMessage = (msg: string, ctx?: Record<string, any>) => {
      if (!ctx || Object.keys(ctx).length === 0) {
        return msg;
      }
      return `${msg} ${JSON.stringify(ctx, null, 2)}`;
    };

    switch (entry.level) {
      case 'debug':
        if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
          console.debug(prefix, formatMessage(entry.message, entry.context));
        }
        break;
      case 'info':
        console.info(prefix, formatMessage(entry.message, entry.context));
        break;
      case 'warn':
        console.warn(prefix, formatMessage(entry.message, entry.context));
        break;
      case 'error':
        console.error(prefix, formatMessage(entry.message, entry.context));
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  private async sendToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_API_KEY || ''}`
        },
        body: JSON.stringify({
          source: 'buscadis-frontend',
          environment: process.env.NODE_ENV,
          logs
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // No usar this.error aquí para evitar recursión infinita
      console.error('Failed to send logs to remote endpoint:', error);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupErrorHandlers(): void {
    // Browser error handling
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Uncaught error', {
          error: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', {
          error: {
            reason: event.reason,
            stack: event.reason instanceof Error ? event.reason.stack : undefined
          }
        });
      });
    }

    // Node.js error handling
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.error('Uncaught exception', {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        });
      });

      process.on('unhandledRejection', (reason, promise) => {
        this.error('Unhandled rejection', {
          error: {
            reason,
            promise: promise.toString(),
            stack: reason instanceof Error ? reason.stack : undefined
          }
        });
      });
    }
  }

  private getEnvironmentLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (envLevel && envLevel in this.LOG_LEVELS) {
      return envLevel;
    }
    
    // Default por ambiente
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  }

  private getCallerInfo(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    // Buscar la primera línea que no sea de este archivo
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line && !line.includes('logging.service')) {
        const match = line.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          return `${match[1]} (${match[2]}:${match[3]})`;
        }
      }
    }
    
    return 'unknown';
  }

  private getSessionId(): string {
    // En browser, usar sessionStorage
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('buscadis_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        sessionStorage.setItem('buscadis_session_id', sessionId);
      }
      return sessionId;
    }
    
    // En servidor, generar ID único
    return `server_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getRequestId(): string {
    // En contexto de request, obtener del header o generar
    // Por ahora, generar siempre
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    
    return 0;
  }
}

// Exportar instancia singleton
export const Logger = LoggingService.getInstance();

// También exportar la clase para testing
export { LoggingService }; 