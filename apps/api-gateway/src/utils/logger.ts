export interface LogMetadata {
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

export class StructuredLogger {
  private serviceName: string;

  constructor(serviceName: string = 'api-gateway') {
    this.serviceName = serviceName;
  }

  private format(level: string, message: string, meta?: LogMetadata): string {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...meta,
    };
    return JSON.stringify(entry);
  }

  info(message: string, meta?: LogMetadata): void {
    console.log(this.format('INFO', message, meta));
  }

  warn(message: string, meta?: LogMetadata): void {
    console.warn(this.format('WARN', message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: LogMetadata): void {
    const errObj =
      error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : { errorDetails: error };
    console.error(this.format('ERROR', message, { ...errObj, ...meta }));
  }

  debug(message: string, meta?: LogMetadata): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('DEBUG', message, meta));
    }
  }
}

export const logger = new StructuredLogger('api-gateway');
