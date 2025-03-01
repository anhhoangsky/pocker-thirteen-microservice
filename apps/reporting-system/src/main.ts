import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ReportingSystemModule } from './reporting-system.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ReportingSystemModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.REPORTING_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.REPORTING_SERVICE_PORT || '3003'),
      },
    },
  );
  await app.listen();
  console.log('Reporting System Microservice is listening');
}
bootstrap();