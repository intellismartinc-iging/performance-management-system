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

/**
 * The company and the actor are not in the body: they come from the signed-in
 * account. The name, category, and review type are required for a new template.
 */
export class CreateBehavioralTemplateDto {
  @ApiProperty({ maxLength: 120, example: 'Quarterly Performance Review' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ maxLength: 2000, description: 'Instructions for the respondent.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: BEHAVIORAL_TEMPLATE_CATEGORIES })
  @IsIn([...BEHAVIORAL_TEMPLATE_CATEGORIES])
  category: BehavioralTemplateCategory;

  @ApiProperty({ enum: BEHAVIORAL_REVIEW_TYPES })
  @IsIn([...BEHAVIORAL_REVIEW_TYPES])
  reviewType: BehavioralReviewType;

  @ApiProperty({ type: [SectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}
