import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { GameScore } from './game-score.entity';

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

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    notifications?: boolean;
    language?: string;
  };
}
