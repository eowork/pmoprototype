import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as os from 'os';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk?: HealthCheck;
  };
}

interface DatabaseInfo {
  connected: boolean;
  serverTime: string | null;
  tableCount: number | null;
  version: string | null;
  tables?: string[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get overall system health status with detailed checks
   */
  async getHealthStatus(): Promise<HealthResponse> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const timestamp = new Date().toISOString();

    // Check database health with latency measurement
    const dbCheck = await this.checkDatabase();

    // Check memory health
    const memoryCheck = this.checkMemory();

    // Determine overall status
    let status: 'ok' | 'degraded' | 'error' = 'ok';
    if (dbCheck.status === 'unhealthy') {
      status = 'error';
    } else if (memoryCheck.status === 'unhealthy') {
      status = 'degraded';
    }

    return {
      status,
      timestamp,
      uptime,
      version: '2.8.0',
      checks: {
        database: dbCheck,
        memory: memoryCheck,
      },
    };
  }

  /**
   * Check database connectivity with latency measurement
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const isConnected = await this.databaseService.isConnected();
      const latency = Date.now() - startTime;

      if (!isConnected) {
        return {
          status: 'unhealthy',
          latency,
          message: 'Database connection failed',
        };
      }

      // Consider slow if over 1000ms
      if (latency > 1000) {
        return {
          status: 'unhealthy',
          latency,
          message: 'Database response slow',
        };
      }

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: error.message,
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheck {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = Math.round((usedMemory / totalMemory) * 100);

    // Consider unhealthy if memory usage is above 90%
    if (usagePercent > 90) {
      return {
        status: 'unhealthy',
        message: `Memory usage: ${usagePercent}%`,
      };
    }

    return {
      status: 'healthy',
      message: `Memory usage: ${usagePercent}%`,
    };
  }

  /**
   * Get detailed database information
   */
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      const isConnected = await this.databaseService.isConnected();

      if (!isConnected) {
        return {
          connected: false,
          serverTime: null,
          tableCount: null,
          version: null,
        };
      }

      const serverTime = await this.databaseService.getServerTime();
      const tableCount = await this.databaseService.getTableCount();
      const version = await this.databaseService.getVersion();

      // Get list of tables
      const tablesResult = await this.databaseService.query<{
        table_name: string;
      }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      );
      const tables = tablesResult.rows.map((row) => row.table_name);

      return {
        connected: true,
        serverTime: serverTime.toISOString(),
        tableCount,
        version: version.split(',')[0], // Simplify version string
        tables,
      };
    } catch (error) {
      this.logger.error('Database info failed:', error.message);
      return {
        connected: false,
        serverTime: null,
        tableCount: null,
        version: null,
      };
    }
  }
}
