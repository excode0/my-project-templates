/**
 * Application Logger
 * Structured logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(entry: LogEntry): void {
    const logMessage = {
      ...entry,
      timestamp: this.formatTimestamp(),
    };

    // In production, you'd send this to a logging service (e.g., Sentry, LogRocket)
    // For now, we'll use console with proper formatting
    const consoleMethod = entry.level === 'error' ? 'error' 
      : entry.level === 'warn' ? 'warn' 
      : entry.level === 'debug' ? 'debug'
      : 'info';

    if (this.isDevelopment) {
      console[consoleMethod](
        `[${entry.level.toUpperCase()}] ${entry.message}`,
        entry.context || '',
        entry.error || ''
      );
    } else {
      // Production: structured JSON logging
      console[consoleMethod](JSON.stringify(logMessage));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log({ level: 'debug', message, context });
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({ level: 'info', message, context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log({ level: 'warn', message, context });
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({ 
      level: 'error', 
      message, 
      error, 
      context: {
        ...context,
        stack: error?.stack,
      } 
    });
  }

  // Specialized loggers for common scenarios
  api = {
    request: (method: string, path: string, userId?: string) => {
      this.debug('API Request', { method, path, userId });
    },
    response: (method: string, path: string, status: number, duration?: number) => {
      this.debug('API Response', { method, path, status, duration });
    },
    error: (method: string, path: string, error: Error) => {
      this.error(`API Error: ${method} ${path}`, error);
    },
  };

  db = {
    query: (query: string, duration?: number) => {
      this.debug('Database Query', { query, duration });
    },
    error: (query: string, error: Error) => {
      this.error('Database Error', error, { query });
    },
  };

  auth = {
    login: (userId: string, method: string) => {
      this.info('User Login', { userId, method });
    },
    logout: (userId: string) => {
      this.info('User Logout', { userId });
    },
    failed: (email: string, reason: string) => {
      this.warn('Authentication Failed', { email, reason });
    },
  };

  payment = {
    initiated: (userId: string, templateId: string, amount: number) => {
      this.info('Payment Initiated', { userId, templateId, amount });
    },
    success: (userId: string, purchaseId: string, amount: number) => {
      this.info('Payment Success', { userId, purchaseId, amount });
    },
    failed: (userId: string, reason: string) => {
      this.warn('Payment Failed', { userId, reason });
    },
  };
}

// Singleton instance
export const logger = new Logger();
