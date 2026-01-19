import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators';

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

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns system health status with individual component checks' })
  @ApiResponse({ status: 200, description: 'System is healthy (status: ok or degraded)' })
  @ApiResponse({ status: 503, description: 'System is unhealthy (status: error)' })
  async checkHealth(): Promise<HealthResponse> {
    return this.healthService.getHealthStatus();
  }

  @Get('db')
  @ApiOperation({ summary: 'Database info', description: 'Returns detailed database information including tables' })
  @ApiResponse({ status: 200, description: 'Database information retrieved successfully' })
  async checkDatabase(): Promise<object> {
    return this.healthService.getDatabaseInfo();
  }
}
