import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/** A row of a custom reference table. Its cells are in kpi_indicator_matrix_cells. */
@Entity({ name: 'kpi_indicator_matrix_rows', schema: 'pms' })
export class KpiIndicatorMatrixRow {
  @ApiProperty()
  @PrimaryColumn({ name: 'row_id', type: 'uuid' })
  rowId: string;

  @ApiProperty()
  @Column({ name: 'indicator_id', type: 'uuid' })
  indicatorId: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'row_label', type: 'text', nullable: true })
  rowLabel: string | null;

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  position: number;
}
