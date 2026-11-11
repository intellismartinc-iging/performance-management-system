import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { KpiIndicatorScale } from './kpi-indicator-scale.entity.js';
import { KpiIndicatorMatrixRow } from './kpi-indicator-matrix-row.entity.js';
import { KpiIndicatorMatrixColumn } from './kpi-indicator-matrix-column.entity.js';

export const IndicatorDirectionValues = [
  'higher_is_better',
  'lower_is_better',
] as const;

export type IndicatorDirection = (typeof IndicatorDirectionValues)[number];

@Entity({ name: 'kpi_indicators', schema: 'pms' })
export class KpiIndicator {
  @ApiProperty()
  @PrimaryColumn({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty()
  @Column({ name: 'version_id', type: 'uuid' })
  versionId: string;

  @ApiProperty()
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  unit: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'numeric', nullable: true })
  target: number | null;

  @ApiProperty({ enum: IndicatorDirectionValues })
  @Column({ type: 'text' })
  direction: IndicatorDirection;

  @ApiProperty()
  @Column({ type: 'numeric' })
  weight: number;

  @ApiProperty()
  @Column({ name: 'score_target_met', type: 'integer' })
  scoreTargetMet: number;

  @ApiProperty()
  @Column({ name: 'score_below_target', type: 'integer' })
  scoreBelowTarget: number;

  @ApiProperty({ default: true })
  @Column({ name: 'use_for_scoring', type: 'boolean', default: true })
  useForScoring: boolean;

  @ApiProperty({ isArray: true })
  @OneToMany(() => KpiIndicatorScale, (scale) => scale.indicatorId)
  scales: KpiIndicatorScale[];

  @ApiProperty({ isArray: true })
  @OneToMany(() => KpiIndicatorMatrixRow, (row) => row.indicatorId)
  matrixRows: KpiIndicatorMatrixRow[];

  @ApiProperty({ isArray: true })
  @OneToMany(() => KpiIndicatorMatrixColumn, (col) => col.indicatorId)
  matrixColumns: KpiIndicatorMatrixColumn[];
}
