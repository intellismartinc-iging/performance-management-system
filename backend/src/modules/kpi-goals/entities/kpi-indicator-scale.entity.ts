import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'kpi_indicator_scales', schema: 'pms' })
export class KpiIndicatorScale {
  @ApiProperty()
  @PrimaryColumn({ name: 'scale_id', type: 'uuid' })
  scaleId: string;

  @ApiProperty()
  @Column({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty({ description: 'Inclusive lower bound.' })
  @Column({ name: 'lower_bound', type: 'numeric' })
  lowerBound: number;

  @ApiProperty({
    description: 'Inclusive upper bound. NULL means unbounded.',
    nullable: true,
  })
  @Column({ name: 'upper_bound', type: 'numeric', nullable: true })
  upperBound: number | null;

  @ApiProperty()
  @Column({ type: 'integer' })
  score: number;
}
