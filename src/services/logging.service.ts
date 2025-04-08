// src\services\logging.service.ts
import { toast } from 'react-hot-toast';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogOptions {
  message: string;
  context?: Record<string, any>;
}

/**
 * Simple logging service for the application.
 * In a production environment, this would send logs to a server.
 */
export class Logger {
  private static readonly COLORS = {
    debug: '#949ba5',
    info: '#0284c7',
    warn: '#ca8a04',
    error: '#dc2626',
    success: '#16a34a'
  };

  /**
   * General log method with level
   */
  private static log(level: LogLevel, options: LogOptions | string): void {
    const isDev = process.env.NODE_ENV !== 'production';
    
    // Early return if not in development mode and level is debug
    if (!isDev && level === 'debug') return;
    
    const message = typeof options === 'string' ? options : options.message;
    const context = typeof options === 'string' ? undefined : options.context;
    
    // Format the log message
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Log to console with color in development
    if (isDev) {
      const style = `color: ${this.COLORS[level]}; font-weight: bold;`;
      if (context) {
        console.log(`%c${formattedMessage}`, style, context);
      } else {
        console.log(`%c${formattedMessage}`, style);
      }
    } else {
      // In production, we would send logs to a server
      // For now, we'll just log errors to console
      if (level === 'error') {
        console.error(formattedMessage, context);
      }
    }
  }

  /**
   * Debug level log
   */
  static debug(message: string, context?: Record<string, any>): void {
    this.log('debug', { message, context });
  }

  /**
   * Info level log
   */
  static info(message: string, context?: Record<string, any>): void {
    this.log('info', { message, context });
  }

  /**
   * Warning level log
   */
  static warn(message: string, context?: Record<string, any>): void {
    this.log('warn', { message, context });
  }

  /**
   * Error level log
   */
  static error(message: string, context?: Record<string, any>): void {
    this.log('error', { message, context });
  }

  /**
   * Success level log
   */
  static success(message: string, context?: Record<string, any>): void {
    this.log('success', { message, context });
  }
} 