import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity.js';
import { EmployeeModule } from '../employees/employees.module.js';
import { AdminRoleGuard } from '../employees/guards/admin-role.guard.js';
import { KpiGoalsController } from './controllers/kpi-goals.controller.js';
import { CompanyResolver } from './services/company-resolver.service.js';
import { KpiGoalsService } from './services/kpi-goals.service.js';
import { KpiGoalTemplate } from './entities/kpi-goal-template.entity.js';
import { KpiTemplateVersion } from './entities/kpi-template-version.entity.js';
import { KpiIndicator } from './entities/kpi-indicator.entity.js';
import { KpiIndicatorScale } from './entities/kpi-indicator-scale.entity.js';
import { KpiIndicatorMatrixRow } from './entities/kpi-indicator-matrix-row.entity.js';
import { KpiIndicatorMatrixCell } from './entities/kpi-indicator-matrix-cell.entity.js';
import { KpiIndicatorMatrixColumn } from './entities/kpi-indicator-matrix-column.entity.js';

@Module({
  imports: [
    EmployeeModule,
    TypeOrmModule.forFeature([
      User,
      KpiGoalTemplate,
      KpiTemplateVersion,
      KpiIndicator,
      KpiIndicatorScale,
      KpiIndicatorMatrixRow,
      KpiIndicatorMatrixColumn,
      KpiIndicatorMatrixCell,
    ]),
  ],
  controllers: [KpiGoalsController],
  providers: [KpiGoalsService, CompanyResolver, AdminRoleGuard],
  exports: [KpiGoalsService],
})
export class KpiGoalsModule {}
