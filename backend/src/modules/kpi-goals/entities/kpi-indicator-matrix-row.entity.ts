import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'kpi_indicator_matrix_rows', schema: 'pms' })
export class KpiIndicatorMatrixRow {
  @ApiProperty()
  @PrimaryColumn({ name: 'row_id', type: 'uuid' })
  rowId: string;

  @ApiProperty()
  @Column({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty()
  @Column({ name: 'row_label', type: 'text' })
  rowLabel: string;
}
