import { NestFactory } from '@nestjs/core';
import { FinancialManagementModule } from './financial-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FinancialManagementModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      retryAttempts: 5,
      retryDelay: 1000,
      // Use Dapr pub/sub to receive messages
      pubSubName: 'pubsub',
      topic: 'financial-management',
    },
  });
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}