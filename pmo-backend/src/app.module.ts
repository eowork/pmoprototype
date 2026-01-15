import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UniversityOperationsModule } from './university-operations/university-operations.module';
import { ProjectsModule } from './projects/projects.module';
import { ConstructionProjectsModule } from './construction-projects/construction-projects.module';
import { RepairProjectsModule } from './repair-projects/repair-projects.module';
import { GadModule } from './gad/gad.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    // Database connection
    DatabaseModule,
    // Authentication
    AuthModule,
    // Health check endpoint
    HealthModule,
    // Domain modules
    UniversityOperationsModule,
    ProjectsModule,
    ConstructionProjectsModule,
    RepairProjectsModule,
    GadModule,
    // User administration
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT guard (all routes protected by default)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
