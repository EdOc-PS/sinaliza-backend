import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
 const app = await NestFactory.create(AppModule);

  // ---- CORS ----
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // ---- Filtragem e Validações ----
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,         // converte string → number automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---- Swagger ----
  const config = new DocumentBuilder()
    .setTitle('Sinaliza — API')
    .setDescription(
      'API do repositório digital de sinais de Libras.\n\n' +
      '**Roles disponíveis:** `STUDENT` · `EDUCATOR` · `GUARDIAN` · `ADMIN`\n\n' +
      '**Autenticação:** JWT Bearer — faça login em `/auth/login` e use o token retornado.',
    )
    .setVersion('1.0')
    .addTag('Auth', 'Autenticação e registro de usuários')
    .addTag('Disciplines', 'Gerenciamento de disciplinas e matrículas')
    .addTag('Users', 'Gerenciamento de usuários')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token JWT obtido em /auth/login' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ---- Porta ----
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
