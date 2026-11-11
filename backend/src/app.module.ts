import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createObserveModule } from "@nestjs/observe";
import { AuthModule } from "./modules/auth/auth.module.js";
import { BehavioralAssessmentModule } from "./modules/behavioral-assessment/behavioral-assessment.module.js";
import { EmployeeModule } from "./modules/employees/employees.module.js";
import { User } from "./modules/auth/entities/user.entity.js";
import { Employee } from "./modules/auth/entities/employee.entity.js";
import { EmployeeDomain } from "./modules/employees/entities/employee-domain.entity.js";
import { BehavioralTemplate } from "./modules/behavioral-assessment/entities/behavioral-template.entity.js";
import { BehavioralTemplateVersion } from "./modules/behavioral-assessment/entities/behavioral-template-version.entity.js";
import { BehavioralSection } from "./modules/behavioral-assessment/entities/behavioral-section.entity.js";
import { BehavioralQuestion } from "./modules/behavioral-assessment/entities/behavioral-question.entity.js";
import { BehavioralChoiceOption } from "./modules/behavioral-assessment/entities/behavioral-choice-option.entity.js";
import { KpiGoalsModule } from "./modules/kpi-goals/kpi-goals.module.js";
import { KpiGoalTemplate } from "./modules/kpi-goals/entities/kpi-goal-template.entity.js";
import { KpiTemplateVersion } from "./modules/kpi-goals/entities/kpi-template-version.entity.js";
import { KpiIndicator } from "./modules/kpi-goals/entities/kpi-indicator.entity.js";
import { KpiIndicatorScale } from "./modules/kpi-goals/entities/kpi-indicator-scale.entity.js";
import { KpiIndicatorMatrixRow } from "./modules/kpi-goals/entities/kpi-indicator-matrix-row.entity.js";
import { KpiIndicatorMatrixColumn } from "./modules/kpi-goals/entities/kpi-indicator-matrix-column.entity.js";
import { HREmployee, HREmploymentRecord, HRUser } from "./modules/auth/entities/hrdotnet.entity.js";
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // MAIN DATABASE (postgres)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        autoLoadEntities: true,
        host: config.get<string>("POSTGRES_HOST", "localhost"),
        port: config.get<number>("POSTGRES_PORT", 5433),
        database: config.get<string>("POSTGRES_DB", "postgres"),
        username: config.get<string>("POSTGRES_USER", "postgres"),
        password: config.get<string>("POSTGRES_PASSWORD", ""),
        entities: [
          User,
          EmployeeDomain,
          BehavioralTemplate,
          BehavioralTemplateVersion,
          BehavioralSection,
          BehavioralQuestion,
          BehavioralChoiceOption,
          KpiGoalTemplate,
          KpiTemplateVersion,
          KpiIndicatorScale,
          KpiIndicator,
          KpiIndicatorMatrixColumn,
          KpiIndicatorMatrixRow,
        ],
        synchronize: true,
      }),
    }),

    // SECONDARY DATABASE (MSSQL / HRDotNet, read-only)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: "secondaryDB",
      useFactory: (config: ConfigService) => {
        const connectTimeout = Number(config.get("DB_CONNECTION_TIMEOUT", "30000"));

        const requestTimeout = Number(config.get("DB_REQUEST_TIMEOUT", "30000"));

        const host = config.get<string>("DB_HOST");
        const username = config.get<string>("DB_USERNAME");
        const password = config.get<string>("DB_PASSWORD");
        const database = config.get<string>("DB_DATABASE");

        if (!host || !username || !password || !database) {
          throw new Error("Missing required MSSQL environment variables");
        }

        if (!Number.isFinite(connectTimeout) || !Number.isFinite(requestTimeout)) {
          throw new Error("Invalid MSSQL timeout configuration");
        }

        return {
          type: "mssql" as const,
          host,
          port: Number(config.get("DB_PORT", "1433")),
          username,
          password,
          database,
          options: {
            encrypt: config.get<string>("DB_ENCRYPT") === "true",
            trustServerCertificate: config.get<string>("DB_TRUST_SERVER_CERTIFICATE") === "true",
            connectTimeout,
            requestTimeout,
          },
          connectionTimeout: connectTimeout,
          requestTimeout,
          pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
          entities: [HREmployee, HREmploymentRecord, HRUser],
          synchronize: false,
        };
      },
    }),

    // LIST OF MODULES
    AuthModule,
    BehavioralAssessmentModule,
    EmployeeModule,
    KpiGoalsModule,

    ObserveModule.forRoot({ appKey: "YOUR_APP_KEY", appSecret: "YOUR_APP_SECRET", serviceId: "pms" }),
  ],
})
export class AppModule {}
