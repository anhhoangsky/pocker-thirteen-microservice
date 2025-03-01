import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportingController } from './infrastructure/controllers/reporting.controller';
import { ReportingService } from './application/services/reporting.service';
import { ReportingRepository } from './infrastructure/repositories/reporting.repository';
import { Report } from './domain/entities/report.entity';
import { ReportTemplate } from './domain/entities/report-template.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
      username: process.env.POSTGRES_USERNAME || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.DB_POSTGRES || 'pocker_finance',
      entities: [Report, ReportTemplate],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Report, ReportTemplate]),
    ClientsModule.register([
      {
        name: 'FINANCIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.FINANCIAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.FINANCIAL_SERVICE_PORT || '3001'),
        },
      },
      {
        name: 'GAME_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GAME_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GAME_SERVICE_PORT || '3002'),
        },
      },
    ]),
  ],
  controllers: [ReportingController],
  providers: [
    ReportingService,
    {
      provide: 'IReportingRepository',
      useClass: ReportingRepository,
    },
  ],
})
export class ReportingSystemModule {}