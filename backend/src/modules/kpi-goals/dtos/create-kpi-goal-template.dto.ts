import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IndicatorDto } from './kpi-indicator.dto.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateKpiGoalTemplateDto {
  @ApiProperty({ maxLength: 120, example: 'Software Engineer Performance Goals' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'integer',
    minimum: 1,
    description:
      'Optional pms.positions row of your company. Null means company-wide. The company itself comes from your account.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  positionId?: number | null;

  @ApiProperty({ type: [IndicatorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndicatorDto)
  indicators: IndicatorDto[];
}
