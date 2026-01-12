import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): object {
    return {
      name: 'PMO Dashboard API',
      version: '2.3.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api (coming soon)',
      },
    };
  }
}
