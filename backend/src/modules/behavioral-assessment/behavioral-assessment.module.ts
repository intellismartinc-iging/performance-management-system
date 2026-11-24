import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity.js';
import { EmployeeModule } from '../employees/employees.module.js';
import { AdminRoleGuard } from '../employees/guards/admin-role.guard.js';
import { KpiGoalsModule } from '../kpi-goals/kpi-goals.module.js';
import { BehavioralAssessmentController } from './controllers/behavioral-assessment.controller.js';
import { BehavioralAssessmentService } from './services/behavioral-assessment.service.js';
import { BehavioralTemplate } from './entities/behavioral-template.entity.js';
import { BehavioralTemplateVersion } from './entities/behavioral-template-version.entity.js';
import { BehavioralSection } from './entities/behavioral-section.entity.js';
import { BehavioralQuestion } from './entities/behavioral-question.entity.js';
import { BehavioralChoiceOption } from './entities/behavioral-choice-option.entity.js';

@Module({
  imports: [
    EmployeeModule,
    KpiGoalsModule,
    TypeOrmModule.forFeature([
      User,
      BehavioralTemplate,
      BehavioralTemplateVersion,
      BehavioralSection,
      BehavioralQuestion,
      BehavioralChoiceOption,
    ]),
  ],
  controllers: [BehavioralAssessmentController],
  providers: [BehavioralAssessmentService, AdminRoleGuard],
  exports: [BehavioralAssessmentService],
})
export class BehavioralAssessmentModule {}
