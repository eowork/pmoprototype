import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

interface HealthResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  serverTime: string;
  tableCount?: number;
  version?: string;
  uptime: number;
}

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   * Returns system health status including database connectivity
   */
  @Get()
  async checkHealth(): Promise<HealthResponse> {
    return this.healthService.getHealthStatus();
  }

  /**
   * GET /health/db
   * Returns detailed database information
   */
  @Get('db')
  async checkDatabase(): Promise<object> {
    return this.healthService.getDatabaseInfo();
  }
}
