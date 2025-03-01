import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for mobile app
  app.enableCors({
    origin: '*', // In production, this should be restricted to your mobile app's domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Poker Thirteen Mobile API')
    .setDescription('API documentation for Poker Thirteen Mobile Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

if (require.main === module) {
  bootstrap();
}