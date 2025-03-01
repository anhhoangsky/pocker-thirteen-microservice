import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportTemplate } from './report-template.entity';

export enum ReportType {
  FINANCIAL = 'financial',
  GAME_STATISTICS = 'game_statistics',
  PLAYER_PERFORMANCE = 'player_performance',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.JSON,
  })
  format: ReportFormat;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  generatedBy: string;

  @Column({ type: 'jsonb' })
  parameters: {
    startDate?: string;
    endDate?: string;
    playerId?: string;
    gameId?: string;
    gameType?: string;
    customFilters?: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  data: any;

  @ManyToOne(() => ReportTemplate, { nullable: true })
  @JoinColumn()
  template: ReportTemplate;

  @Column({ nullable: true })
  filePath: string;
}