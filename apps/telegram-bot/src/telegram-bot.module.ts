import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TelegramBotService } from './telegram-bot.service';
import { FINANCIAL_SERVICE, GAME_SERVICE } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DaprModule,
    ClientsModule.registerAsync([
      {
        name: GAME_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT')) || 6379,
            retryAttempts: 5,
            retryDelay: 1000,
            // Use Dapr pub/sub to communicate with game-management service
            pubSubName: 'pubsub',
            topic: 'game-management',
          },
        }),
        inject: [ConfigService],
      },
      {
        name: FINANCIAL_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT')) || 6379,
            retryAttempts: 5,
            retryDelay: 1000,
            // Use Dapr pub/sub to communicate with financial-management service
            pubSubName: 'pubsub',
            topic: 'financial-management',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}