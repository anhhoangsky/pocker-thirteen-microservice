import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { GameScore } from './game-score.entity';
import { Player } from './player.entity';

export enum GameType {
  POKER = 'poker',
  TIENLEN = 'tienlen',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: GameType,
  })
  type!: GameType;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  endedAt?: Date;

  @ManyToMany(() => Player, { eager: false })
  @JoinTable()
  players!: Player[];

  @OneToMany(() => GameScore, (score: GameScore): Game => score.game)
  scores!: GameScore[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    initialPoints?: number;
    pointValue?: number;
    maxPlayers?: number;
  };
}
