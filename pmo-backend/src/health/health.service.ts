import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface HealthResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  serverTime: string;
  tableCount?: number;
  version?: string;
  uptime: number;
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
   * Get overall system health status
   */
  async getHealthStatus(): Promise<HealthResponse> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    try {
      const isConnected = await this.databaseService.isConnected();

      if (!isConnected) {
        return {
          status: 'error',
          database: 'disconnected',
          serverTime: new Date().toISOString(),
          uptime,
        };
      }

      const serverTime = await this.databaseService.getServerTime();
      const tableCount = await this.databaseService.getTableCount();

      return {
        status: 'ok',
        database: 'connected',
        serverTime: serverTime.toISOString(),
        tableCount,
        uptime,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error.message);
      return {
        status: 'error',
        database: 'disconnected',
        serverTime: new Date().toISOString(),
        uptime,
      };
    }
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
