import { NestFactory } from '@nestjs/core';
import { GameManagementModule } from './game-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(GameManagementModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      retryAttempts: 5,
      retryDelay: 1000,
      // Use Dapr pub/sub to receive messages
      pubSubName: 'pubsub',
      topic: 'game-management',
    },
  });
  
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}