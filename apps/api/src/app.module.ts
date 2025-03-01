import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MobileApiModule } from './mobile-api/mobile-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'GAME_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('GAME_SERVICE_HOST', 'localhost'),
            port: configService.get('GAME_SERVICE_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'FINANCIAL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('FINANCIAL_SERVICE_HOST', 'localhost'),
            port: configService.get('FINANCIAL_SERVICE_PORT', 3002),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MobileApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}