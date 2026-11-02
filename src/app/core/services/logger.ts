import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment';

export type LogContext = Readonly<Record<string, string | number | boolean | any>>;
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root',
})
export class Logger {
  debug(event: string, context: LogContext = {}): void {
    this.write('debug', event, context);
  }

  info(event: string, context: LogContext = {}): void {
    this.write('info', event, context);
  }

  warn(event: string, context: LogContext = {}): void {
    this.write('warn', event, context);
  }

  error(event: string, error?: unknown, context: LogContext = {}): void {
    const errorContext = this.getErrorContext(error);
    this.write('error', event, { ...context, ...errorContext });
  }

  private write(level: LogLevel, event: string, context: LogContext): void {
    if (environment.production && (level === 'debug' || level === 'info')) return;

    const entry = {
      level,
      event,
      timestamp: new Date().toISOString(),
      ...context,
    };

    console[level](entry);
  }

  private getErrorContext(error: unknown): LogContext {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = error.code;
      if (typeof code === 'string') return { errorCode: code };
    }

    if (error instanceof Error) {
      return { errorName: error.name };
    }

    return error === undefined ? {} : { errorName: 'UnknownError' };
  }
}
