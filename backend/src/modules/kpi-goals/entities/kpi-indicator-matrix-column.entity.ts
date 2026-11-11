import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'kpi_indicator_matrix_columns', schema: 'pms' })
export class KpiIndicatorMatrixColumn {
  @ApiProperty()
  @PrimaryColumn({ name: 'col_id', type: 'uuid' })
  colId: string;

  @ApiProperty()
  @Column({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty()
  @Column({ name: 'col_label', type: 'text' })
  colLabel: string;
}
