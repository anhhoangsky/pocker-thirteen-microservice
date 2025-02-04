import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  EntityOptions,
  RelationOptions,
  ColumnOptions,
} from 'typeorm';
import { Game } from './game.entity';
import { Player } from './player.entity';

@Entity('game_score' as EntityOptions)
export class GameScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Game, (game: Game) => game.scores, {
    onDelete: 'CASCADE',
  } as RelationOptions)
  @JoinColumn({ name: 'game_id' })
  game!: Game;

  @ManyToOne(() => Player, (player: Player) => player.scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  } as ColumnOptions)
  points!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    rank?: number;
    isReload?: boolean;
    notes?: string;
  };
}
