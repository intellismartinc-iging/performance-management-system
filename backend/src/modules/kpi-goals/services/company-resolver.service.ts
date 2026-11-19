import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { EmployeeService } from '../../employees/services/employee.service.js';

const NO_COMPANY = 'No company is linked to your account.';

/** The company of an account, and the actor that its writes are recorded under. */
export interface ResolvedAccount {
  companyId: number;
  /**
   * The GUID of the account's `pms.employees` row. `created_by` and `published_by`
   * are uuid columns that refer to it: the numeric id of a login is not a uuid.
   * Null when the row has no GUID, or when more than one row matches.
   */
  actorId: string | null;
}

/**
 * Finds the company of the signed-in account. The login chain ends at
 * `public.employees`, which has no company, so this matches the account to its
 * `pms.employees` row by HRDotNet id, or by employee code when it has none.
 * It reads `pms.employees` with raw SQL on purpose: with `synchronize: true`, a
 * partial TypeORM entity for that table would make TypeORM drop its other columns.
 */
@Injectable()
export class CompanyResolver {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly employees: EmployeeService,
    private readonly dataSource: DataSource,
  ) {}

  async resolveCompanyId(userId: string): Promise<number> {
    return (await this.resolveAccount(userId)).companyId;
  }

  async resolveAccount(userId: string): Promise<ResolvedAccount> {
    const user = await this.users.findOne({ where: { id: userId } });
    const employee = user && (await this.employees.findByUser(user));
    if (!employee) throw new ForbiddenException(NO_COMPANY);

    let rows: { company_id: string; guid: string | null }[] = employee.hrdotnetId
      ? await this.dataSource.manager.query(
          'SELECT company_id, guid FROM pms.employees WHERE hrdotnet_id = $1',
          [employee.hrdotnetId],
        )
      : [];
    if (rows.length === 0) {
      rows = await this.dataSource.manager.query(
        'SELECT company_id, guid FROM pms.employees WHERE code = $1',
        [employee.employeeCode],
      );
    }
    const companies = new Set(rows.map((row) => row.company_id));
    if (companies.size !== 1) throw new ForbiddenException(NO_COMPANY);

    return {
      companyId: Number(rows[0]!.company_id),
      actorId: rows.length === 1 ? (rows[0]!.guid ?? null) : null,
    };
  }
}
