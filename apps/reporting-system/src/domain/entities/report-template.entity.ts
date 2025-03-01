import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ReportType } from './report.entity';

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'jsonb' })
  configuration: {
    fields: Array<{
      name: string;
      label: string;
      type: string;
      aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
      format?: string;
    }>;
    filters: Array<{
      field: string;
      operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'between';
      defaultValue?: any;
    }>;
    sorting: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    groupBy?: string[];
    layout?: {
      sections?: Array<{
        title: string;
        fields: string[];
      }>;
      charts?: Array<{
        type: 'bar' | 'line' | 'pie';
        title: string;
        dataField: string;
        labelField: string;
      }>;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    isPublic: boolean;
    tags: string[];
    category?: string;
  };
}