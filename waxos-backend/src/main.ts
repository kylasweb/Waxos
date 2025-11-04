import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Get configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // Global prefix
  app.setGlobalPrefix(`api/${apiVersion}`);

  // CORS
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);

  logger.log(`🚀 WAXOS Backend is running on: http://localhost:${port}/api/${apiVersion}`);
  logger.log(`📚 Environment: ${configService.get('NODE_ENV')}`);
}

bootstrap();
