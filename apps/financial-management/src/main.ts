import { NestFactory } from '@nestjs/core';
import { FinancialManagementModule } from './financial-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FinancialManagementModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3003,
    },
  });
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}
