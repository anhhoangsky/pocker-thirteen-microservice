import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './infrastructure/controllers/game.controller';
import { GameService } from './application/services/game.service';
import { GameRepository } from './infrastructure/repositories/game.repository';
import { Game } from './domain/entities/game.entity';
import { Player } from './domain/entities/player.entity';
import { GameScore } from './domain/entities/game-score.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'pocker_game',
      entities: [Game, Player, GameScore],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, Player, GameScore]),
  ],
  controllers: [GameController],
  providers: [
    GameService,
    {
      provide: 'IGameRepository',
      useClass: GameRepository,
    },
  ],
})
export class GameManagementModule {}
