import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './infrastructure/controllers/game.controller';
import { GameService } from './application/services/game.service';
import { GameRepository } from './infrastructure/repositories/game.repository';
import { Game } from './domain/entities/game.entity';
import { Player } from './domain/entities/player.entity';
import { GameScore } from './domain/entities/game-score.entity';
import { Round } from './domain/entities/round.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
        host: process.env.POSTGRES_HOST || 'postgres',
      port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
      username: process.env.POSTGRES_USERNAME || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.DB_POSTGRES || 'pocker_game',
        entities: [Game, Player, GameScore, Round],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, Player, GameScore, Round]),
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
