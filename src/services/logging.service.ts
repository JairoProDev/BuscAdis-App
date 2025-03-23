import { toast } from 'react-hot-toast';

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface LogOptions {
  showToast?: boolean;
  duration?: number;
  console?: boolean;
  details?: unknown;
  timestamp?: boolean;
  level?: string;
}

class LoggingService {
  private static defaultOptions: LogOptions = {
    showToast: true,
    duration: 4000,
    console: true
  };

  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(message: string, options: LogOptions = {}): string {
    const timestamp = options.timestamp ? `[${new Date().toISOString()}] ` : '';
    const level = options.level ? `[${options.level}] ` : '';
    return `${timestamp}${level}${message}`;
  }

  private shouldLog(): boolean {
    return this.isDevelopment || this.isTest;
  }

  log(level: LogLevel, message: string, options: LogOptions = {}) {
    const finalOptions = { ...this.defaultOptions, ...options };
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Console logging
    if (finalOptions.console) {
      switch (level) {
        case 'info':
          console.info(`${logPrefix} ${message}`, finalOptions.details || '');
          break;
        case 'success':
          console.log(`${logPrefix} ✅ ${message}`, finalOptions.details || '');
          break;
        case 'warning':
          console.warn(`${logPrefix} ⚠️ ${message}`, finalOptions.details || '');
          break;
        case 'error':
          console.error(`${logPrefix} ❌ ${message}`, finalOptions.details || '');
          break;
        case 'debug':
          console.debug(`${logPrefix} 🔍 ${message}`, finalOptions.details || '');
          break;
      }
    }

    // User feedback via toast
    if (finalOptions.showToast) {
      switch (level) {
        case 'info':
          toast(message, { duration: finalOptions.duration });
          break;
        case 'success':
          toast.success(message, { duration: finalOptions.duration });
          break;
        case 'warning':
          toast.error(message, { duration: finalOptions.duration });
          break;
        case 'error':
          toast.error(message, { duration: finalOptions.duration });
          break;
      }
    }
  }

  info(message: string, options: LogOptions = {}) {
    if (!this.shouldLog()) return;

    const finalOptions = {
      ...options,
      level: 'INFO',
      timestamp: true,
    };

    console.info(
      this.formatMessage(message, finalOptions),
      options.details || ''
    );
  }

  success(message: string, options: LogOptions = {}) {
    if (!this.shouldLog()) return;

    const finalOptions = {
      ...options,
      level: 'SUCCESS',
      timestamp: true,
    };

    console.log(
      '%c' + this.formatMessage(message, finalOptions),
      'color: green',
      options.details || ''
    );
  }

  warn(message: string, options: LogOptions = {}) {
    if (!this.shouldLog()) return;

    const finalOptions = {
      ...options,
      level: 'WARN',
      timestamp: true,
    };

    console.warn(
      this.formatMessage(message, finalOptions),
      options.details || ''
    );
  }

  error(message: string, options: LogOptions = {}) {
    if (!this.shouldLog()) return;

    const finalOptions = {
      ...options,
      level: 'ERROR',
      timestamp: true,
    };

    console.error(
      this.formatMessage(message, finalOptions),
      options.details || ''
    );
  }

  debug(message: string, options: LogOptions = {}) {
    if (!this.shouldLog()) return;

    const finalOptions = {
      ...options,
      level: 'DEBUG',
      timestamp: true,
    };

    console.debug(
      this.formatMessage(message, finalOptions),
      options.details || ''
    );
  }

  group(label: string) {
    if (!this.shouldLog()) return;
    console.group(label);
  }

  groupEnd() {
    if (!this.shouldLog()) return;
    console.groupEnd();
  }

  table(data: unknown[], columns?: string[]) {
    if (!this.shouldLog()) return;
    console.table(data, columns);
  }
}

export const Logger = new LoggingService(); 