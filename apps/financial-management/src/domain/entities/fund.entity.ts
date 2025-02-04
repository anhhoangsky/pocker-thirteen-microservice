import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Fund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.fund)
  transactions: Transaction[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    rules?: string[];
    contributors?: { playerId: string; contribution: number }[];
  };
}
