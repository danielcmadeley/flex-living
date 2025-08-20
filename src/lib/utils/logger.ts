/**
 * Centralized logging utility for consistent application-wide logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  module?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isTest = process.env.NODE_ENV === "test";

  /**
   * Determines if logging should be enabled for a given level
   */
  private shouldLog(level: LogLevel): boolean {
    // Disable all logging in test environment
    if (this.isTest) return false;

    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === "warn" || level === "error";
    }

    return true;
  }

  /**
   * Formats the log message with timestamp and context
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context?.module) {
      return `${prefix} [${context.module}] ${message}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Formats additional data for logging
   */
  private formatData(
    data?: unknown,
    context?: LogContext,
  ): Record<string, unknown> | undefined {
    if (!data && !context?.metadata) return undefined;

    const result: Record<string, unknown> = {};

    if (context) {
      if (context.userId) result.userId = context.userId;
      if (context.action) result.action = context.action;
      if (context.metadata) Object.assign(result, context.metadata);
    }

    if (data) {
      if (data instanceof Error) {
        result.error = {
          message: data.message,
          stack: data.stack,
          name: data.name,
        };
      } else {
        result.data = data;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;

    const formattedMessage = this.formatMessage("debug", message, context);
    const formattedData = this.formatData(data, context);

    if (formattedData) {
      console.log(formattedMessage, formattedData);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Info level logging - general information
   */
  info(message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog("info")) return;

    const formattedMessage = this.formatMessage("info", message, context);
    const formattedData = this.formatData(data, context);

    if (formattedData) {
      console.info(formattedMessage, formattedData);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Warning level logging - potentially harmful situations
   */
  warn(message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;

    const formattedMessage = this.formatMessage("warn", message, context);
    const formattedData = this.formatData(data, context);

    if (formattedData) {
      console.warn(formattedMessage, formattedData);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Error level logging - error events
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog("error")) return;

    const formattedMessage = this.formatMessage("error", message, context);
    const formattedData = this.formatData(error, context);

    if (formattedData) {
      console.error(formattedMessage, formattedData);
    } else {
      console.error(formattedMessage);
    }
  }

  /**
   * Creates a child logger with a specific module context
   */
  child(module: string): LoggerWithContext {
    return new LoggerWithContext(this, { module });
  }
}

/**
 * Logger with pre-configured context
 */
class LoggerWithContext {
  constructor(
    private logger: Logger,
    private context: LogContext,
  ) {}

  debug(message: string, data?: unknown, additionalContext?: LogContext): void {
    const mergedContext = { ...this.context, ...additionalContext };
    this.logger.debug(message, data, mergedContext);
  }

  info(message: string, data?: unknown, additionalContext?: LogContext): void {
    const mergedContext = { ...this.context, ...additionalContext };
    this.logger.info(message, data, mergedContext);
  }

  warn(message: string, data?: unknown, additionalContext?: LogContext): void {
    const mergedContext = { ...this.context, ...additionalContext };
    this.logger.warn(message, data, mergedContext);
  }

  error(
    message: string,
    error?: unknown,
    additionalContext?: LogContext,
  ): void {
    const mergedContext = { ...this.context, ...additionalContext };
    this.logger.error(message, error, mergedContext);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for context
export type { LogContext };
