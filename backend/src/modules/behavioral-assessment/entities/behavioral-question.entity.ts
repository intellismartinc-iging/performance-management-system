import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BehavioralChoiceOption } from "./behavioral-choice-option.entity.js";

export const QuestionTypeValues = ["rating_scale", "short_answer", "paragraph", "multiple_choice"] as const;

export type QuestionType = (typeof QuestionTypeValues)[number];

@Entity({ name: "behavioral_questions" })
export class BehavioralQuestion {
  @ApiProperty()
  @PrimaryColumn({ name: "question_id", type: "uuid" })
  questionId: string;

  @ApiProperty()
  @Column({ name: "section_id", type: "uuid" })
  sectionId: string;

  @ApiProperty()
  @Column({ type: "text" })
  prompt: string;

  @ApiProperty({ enum: QuestionTypeValues })
  @Column({ name: "question_type", type: "text" })
  questionType: QuestionType;

  @ApiProperty({ default: true })
  @Column({
    name: "is_required",
    type: "boolean",
    default: true,
  })
  isRequired: boolean;

  @ApiProperty({
    description: "rating_scale questions only. NULL for all other question types.",
    nullable: true,
  })
  @Column({
    name: "allow_not_observed",
    type: "boolean",
    nullable: true,
  })
  allowNotObserved: boolean | null;

  @ApiProperty()
  @Column({ name: "sort_order", type: "integer" })
  sortOrder: number;

  @ApiProperty({ isArray: true })
  @OneToMany(() => BehavioralChoiceOption, (option) => option.questionId)
  choiceOptions: BehavioralChoiceOption[];
}
