import { toast } from 'react-hot-toast';

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface LogOptions {
  showToast?: boolean;
  duration?: number;
  console?: boolean;
}

class LoggingService {
  private static defaultOptions: LogOptions = {
    showToast: true,
    duration: 4000,
    console: true
  };

  static log(level: LogLevel, message: string, options: LogOptions = {}) {
    const finalOptions = { ...this.defaultOptions, ...options };
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Console logging
    if (finalOptions.console) {
      switch (level) {
        case 'info':
          console.info(`${logPrefix} ${message}`);
          break;
        case 'success':
          console.log(`${logPrefix} ✅ ${message}`);
          break;
        case 'warning':
          console.warn(`${logPrefix} ⚠️ ${message}`);
          break;
        case 'error':
          console.error(`${logPrefix} ❌ ${message}`);
          break;
        case 'debug':
          console.debug(`${logPrefix} 🔍 ${message}`);
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

  static info(message: string, options?: LogOptions) {
    this.log('info', message, options);
  }

  static success(message: string, options?: LogOptions) {
    this.log('success', message, options);
  }

  static warning(message: string, options?: LogOptions) {
    this.log('warning', message, options);
  }

  static error(message: string, options?: LogOptions) {
    this.log('error', message, options);
  }

  static debug(message: string, options?: LogOptions) {
    this.log('debug', message, { ...options, showToast: false });
  }
}

export const Logger = LoggingService; 