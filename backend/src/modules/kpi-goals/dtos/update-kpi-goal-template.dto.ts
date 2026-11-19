import { CreateKpiGoalTemplateDto } from './create-kpi-goal-template.dto.js';

/** The same body as create: a template keeps its company, which the server sets. */
export class UpdateKpiGoalTemplateDto extends CreateKpiGoalTemplateDto {}
