import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MobileApiController } from './mobile-api.controller';
import { MobileApiService } from './mobile-api.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'poker-thirteen-secret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MobileApiController],
  providers: [MobileApiService],
  exports: [MobileApiService],
})
export class MobileApiModule {}