import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BehavioralSection } from './behavioral-section.entity.js';

@Entity({ name: 'behavioral_template_versions', schema: 'pms' })
export class BehavioralTemplateVersion {
  @ApiProperty()
  @PrimaryColumn({ name: 'version_id', type: 'uuid' })
  versionId: string;

  @ApiProperty()
  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ApiProperty()
  @Column({ type: 'integer' })
  version: number;

  @ApiProperty({
    description: 'NULL until the version is published and frozen.',
    nullable: true,
  })
  @Column({ name: 'frozen_at', type: 'timestamptz', nullable: true })
  frozenAt: Date | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ isArray: true })
  @OneToMany(() => BehavioralSection, (section) => section.versionId)
  sections: BehavioralSection[];
}
