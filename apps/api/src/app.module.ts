import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportingModule } from './reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'GAME_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GAME_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GAME_SERVICE_PORT || '3002'),
        },
      },
      {
        name: 'FINANCIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.FINANCIAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.FINANCIAL_SERVICE_PORT || '3003'),
        },
      },
      {
        name: 'REPORTING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.REPORTING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.REPORTING_SERVICE_PORT || '3004'),
        },
      },
    ]),
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}