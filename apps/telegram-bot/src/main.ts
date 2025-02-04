import { NestFactory } from '@nestjs/core';
import { TelegramBotModule } from './telegram-bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TelegramBotModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });
  await app.listen();
}

if (require.main === module) {
  bootstrap();
}
