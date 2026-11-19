import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/** The text in one cell of a custom reference table. */
@Entity({ name: 'kpi_indicator_matrix_cells', schema: 'pms' })
export class KpiIndicatorMatrixCell {
  @ApiProperty()
  @PrimaryColumn({ name: 'row_id', type: 'uuid' })
  rowId: string;

  @ApiProperty()
  @PrimaryColumn({ name: 'col_id', type: 'uuid' })
  colId: string;

  @ApiProperty()
  @Column({ type: 'text' })
  value: string;
}
