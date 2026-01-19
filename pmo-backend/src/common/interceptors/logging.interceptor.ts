import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface LogEntry {
  timestamp: string;
  level: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Extract user ID from JWT payload if available
    const user = (request as Request & { user?: { sub?: string } }).user;
    const userId = user?.sub;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;

          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            method,
            path: url,
            statusCode,
            duration,
          };

          // Only add user info if available (avoid logging undefined)
          if (userId) {
            logEntry.userId = userId;
          }

          // Log in structured format for production, human-readable for development
          if (process.env.NODE_ENV === 'production') {
            this.logger.log(JSON.stringify(logEntry));
          } else {
            const userInfo = userId ? ` [User: ${userId.substring(0, 8)}...]` : '';
            this.logger.log(
              `${method} ${url} - ${statusCode} - ${duration}ms${userInfo}`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            method,
            path: url,
            statusCode,
            duration,
          };

          if (userId) {
            logEntry.userId = userId;
          }

          if (process.env.NODE_ENV === 'production') {
            this.logger.error(JSON.stringify(logEntry));
          } else {
            const userInfo = userId ? ` [User: ${userId.substring(0, 8)}...]` : '';
            this.logger.error(
              `${method} ${url} - ${statusCode} - ${duration}ms${userInfo}`,
            );
          }
        },
      }),
    );
  }
}
