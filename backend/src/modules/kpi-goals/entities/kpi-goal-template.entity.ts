import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'kpi_goal_templates', schema: 'pms' })
export class KpiGoalTemplate {
  @ApiProperty()
  @PrimaryColumn({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'position_id', type: 'bigint', nullable: true })
  positionId: string | null;

  @ApiProperty()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  @Column({ type: 'text' })
  status: 'draft' | 'published' | 'archived';

  @ApiProperty()
  @Column({ name: 'current_version', type: 'integer', default: 0 })
  currentVersion: number;

  @ApiProperty({ nullable: true })
  @Column({ name: 'published_by', type: 'uuid', nullable: true })
  publishedBy: string | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
