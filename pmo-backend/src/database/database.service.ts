import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { DATABASE_POOL } from './database.constants';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /**
   * Execute a SQL query
   * @param text SQL query string
   * @param params Query parameters (optional)
   * @returns Query result
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * Get current database server time
   * @returns Server timestamp
   */
  async getServerTime(): Promise<Date> {
    const result = await this.query<{ server_time: Date }>(
      'SELECT NOW() as server_time',
    );
    return result.rows[0].server_time;
  }

  /**
   * Check if database is connected
   * @returns Connection status
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get table count in public schema
   * @returns Number of tables
   */
  async getTableCount(): Promise<number> {
    const result = await this.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'",
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get database version
   * @returns PostgreSQL version string
   */
  async getVersion(): Promise<string> {
    const result = await this.query<{ version: string }>('SELECT version()');
    return result.rows[0].version;
  }
}
