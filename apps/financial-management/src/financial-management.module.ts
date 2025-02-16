import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialController } from './infrastructure/controllers/financial.controller';
import { FinancialService } from './application/services/financial.service';
import { Transaction } from './domain/entities/transaction.entity';
import { Fund } from './domain/entities/fund.entity';
import { FinancialRepository } from './infrastructure/repositories/financial.repository';

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
      entities: [Transaction, Fund],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Transaction, Fund]),
  ],
  controllers: [FinancialController],
  providers: [
    FinancialService,
    {
      provide: 'IFinancialRepository',
      useClass: FinancialRepository,
    },
  ],
})
export class FinancialManagementModule {}
