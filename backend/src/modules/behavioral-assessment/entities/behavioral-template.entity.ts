import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type {
  BehavioralReviewType,
  BehavioralTemplateCategory,
} from '@pms/shared-types';

@Entity({ name: 'behavioral_templates', schema: 'pms' })
export class BehavioralTemplate {
  @ApiProperty()
  @PrimaryColumn({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ApiProperty()
  @Column({ name: 'company', type: 'text' })
  company: string;

  /** Required for a new template, in the API. NULL for a row made before the column existed. */
  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  category: BehavioralTemplateCategory | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'review_type', type: 'text', nullable: true })
  reviewType: BehavioralReviewType | null;

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
