import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORTING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.REPORTING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.REPORTING_SERVICE_PORT || '3004'),
        },
      },
    ]),
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}