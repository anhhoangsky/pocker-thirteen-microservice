import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { GameScore } from './game-score.entity';
import { Game } from './game.entity';

@Entity('player')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  telegramId!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar', nullable: true })
  displayName?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number;

  @OneToMany(() => GameScore, (score: GameScore) => score.player, {
    lazy: true,
  })
  scores!: Promise<GameScore[]>;

  @ManyToMany(() => Game, (game) => game.players)
  games!: Game[];

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    notifications?: boolean;
    language?: string;
  };
}
