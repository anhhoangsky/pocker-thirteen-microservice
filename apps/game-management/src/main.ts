import { NestFactory } from '@nestjs/core';
import { GameManagementModule } from './game-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(GameManagementModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3002,
    },
  });
  
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}
