import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'behavioral_choice_options', schema: 'pms' })
export class BehavioralChoiceOption {
  @ApiProperty()
  @PrimaryColumn({ name: 'option_id', type: 'uuid' })
  optionId: string;

  @ApiProperty()
  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @ApiProperty({ description: 'Distinct within the owning question.' })
  @Column({ type: 'text' })
  label: string;
}
