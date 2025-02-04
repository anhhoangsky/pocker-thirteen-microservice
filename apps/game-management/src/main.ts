import { NestFactory } from '@nestjs/core';
import { GameManagementModule } from './game-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(GameManagementModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3002,
    },
  });
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}
