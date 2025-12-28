/**
 * Production-ready logging utility
 * In production, logs should be sent to a monitoring service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, error?: Error, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private log(level: LogLevel, message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.formatMessage(level, message, error, context);

    // In development, log to console
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn :
                           level === 'info' ? console.info : 
                           console.log;
      
      if (error) {
        consoleMethod(`[${level.toUpperCase()}] ${message}`, error, context || '');
      } else {
        consoleMethod(`[${level.toUpperCase()}] ${message}`, context || '');
      }
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      // TODO: Send to Firebase Crashlytics or other monitoring service
      // For now, we'll use console.error for critical errors
      if (level === 'error') {
        console.error(JSON.stringify(entry));
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, undefined, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, error?: Error, context?: Record<string, any>) {
    this.log('warn', message, error, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, error, context);
  }
}

export const logger = new Logger();

