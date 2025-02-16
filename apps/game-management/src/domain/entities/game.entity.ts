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
import { Round } from './round.entity';
import { GameMetadata } from '../interfaces/game-metadata.interface';

export enum GameType {
  POKER = 'poker',
  TIENLEN = 'tienlen',
}

@Entity('games')
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

  @ManyToMany(() => Player, (player) => player.games)
  @JoinTable({
    name: 'game_players',
    joinColumn: {
      name: 'game_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'player_id',
      referencedColumnName: 'id'
    }
  })
  players!: Player[];

  @OneToMany(() => Round, (round) => round.game)
  rounds!: Round[];

  @OneToMany(() => GameScore, (score) => score.game)
  scores!: GameScore[];

  @Column({ type: 'json', nullable: true })
  metadata?: GameMetadata;

  @Column({ type: 'int', default: 1 })
  currentRoundNumber!: number;
}

