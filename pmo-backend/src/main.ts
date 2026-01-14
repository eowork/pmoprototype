import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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

  // API prefix
  app.setGlobalPrefix('api', {
    exclude: ['health'], // Health check at root
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`PMO Backend running on http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`API base: http://localhost:${port}/api`);
}

bootstrap();
