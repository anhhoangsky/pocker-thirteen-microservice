import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TelegramBotService } from './telegram-bot.service';
import { FINANCIAL_SERVICE, GAME_SERVICE } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: GAME_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.GAME_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GAME_SERVICE_PORT) || 3001,
        },
      },
      {
        name: FINANCIAL_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.FINANCIAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.FINANCIAL_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}

