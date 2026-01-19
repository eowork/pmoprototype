import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration (future)
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global logging interceptor for request/response logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  app.setGlobalPrefix('api', {
    exclude: ['health'], // Health check at root
  });

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('PMO Dashboard API')
    .setDescription('Project Management Office REST API for managing construction projects, repairs, university operations, and administrative functions.')
    .setVersion('2.8.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Health check endpoints')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management (Admin only)')
    .addTag('Projects', 'Base project management')
    .addTag('Construction Projects', 'Construction project management')
    .addTag('Repair Projects', 'Repair project management')
    .addTag('University Operations', 'University operations management')
    .addTag('GAD Parity', 'Gender and Development parity data')
    .addTag('Reference: Contractors', 'Contractor reference data')
    .addTag('Reference: Funding Sources', 'Funding source reference data')
    .addTag('Reference: Departments', 'Department reference data')
    .addTag('Reference: Repair Types', 'Repair type reference data')
    .addTag('Reference: Subcategories', 'Construction subcategory reference data')
    .addTag('System Settings', 'System configuration settings')
    .addTag('File Uploads', 'File upload management')
    .addTag('Documents', 'Document attachment management')
    .addTag('Media', 'Media attachment management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`PMO Backend running on http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`API base: http://localhost:${port}/api`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
