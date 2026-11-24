import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  BEHAVIORAL_REVIEW_TYPES,
  BEHAVIORAL_TEMPLATE_CATEGORIES,
  type BehavioralReviewType,
  type BehavioralTemplateCategory,
} from '@pms/shared-types';
import { SectionDto } from './behavioral-section.dto.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** The details are optional on an update: a missing one keeps its stored value. */
export class UpdateBehavioralTemplateDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: BEHAVIORAL_TEMPLATE_CATEGORIES })
  @IsOptional()
  @IsIn([...BEHAVIORAL_TEMPLATE_CATEGORIES])
  category?: BehavioralTemplateCategory;

  @ApiPropertyOptional({ enum: BEHAVIORAL_REVIEW_TYPES })
  @IsOptional()
  @IsIn([...BEHAVIORAL_REVIEW_TYPES])
  reviewType?: BehavioralReviewType;

  @ApiProperty({ type: [SectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}
