import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before anything else
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
console.log(process.env.JWT_SECRET);
console.log(process.env.SMTP_USER);
console.log(process.env.SMTP_PASSWORD);


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation setup 
  const config = new DocumentBuilder()
    .setTitle('Event Venue Booking API')
    .setDescription('The Event Venue Booking Platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}
bootstrap(); 