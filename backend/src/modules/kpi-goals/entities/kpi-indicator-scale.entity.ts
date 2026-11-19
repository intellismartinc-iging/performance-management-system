import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * One threshold of a numeric threshold scale. A minimum scale uses lowerBound
 * (inclusive). A maximum scale uses upperBound (inclusive), and its final row has
 * neither. The rows of a scale are in threshold order.
 */
@Entity({ name: 'kpi_indicator_scales', schema: 'pms' })
export class KpiIndicatorScale {
  @ApiProperty()
  @PrimaryColumn({ name: 'scale_id', type: 'uuid' })
  scaleId: string;

  @ApiProperty()
  @Column({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty({ nullable: true, description: 'Minimum actual, inclusive.' })
  @Column({ name: 'lower_bound', type: 'numeric', nullable: true })
  lowerBound: number | null;

  @ApiProperty({ nullable: true, description: 'Maximum actual, inclusive.' })
  @Column({ name: 'upper_bound', type: 'numeric', nullable: true })
  upperBound: number | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  label: string | null;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 3, scale: 2 })
  score: number;
}
