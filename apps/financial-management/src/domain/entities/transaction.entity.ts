import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Fund } from './fund.entity';

export enum TransactionType {
  GAME_SETTLEMENT = 'game_settlement',
  FUND_DEPOSIT = 'fund_deposit',
  FUND_WITHDRAWAL = 'fund_withdrawal',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  gameId: string;

  @ManyToOne(() => Fund)
  @JoinColumn()
  fund: Fund;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    gameType?: string;
    points?: number;
  };
}
