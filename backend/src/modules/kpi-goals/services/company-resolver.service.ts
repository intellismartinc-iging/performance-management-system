import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { EmployeeService } from '../../employees/services/employee.service.js';

const NO_COMPANY = 'No company is linked to your account.';

/** The company of an account, and the actor that its writes are recorded under. */
export interface ResolvedAccount {
  /** The company name in `pms.employees.company`. The KPI tables store the same text. */
  company: string;
  /**
   * The GUID of the account's `pms.employees` row. `created_by` and `published_by`
   * are uuid columns that refer to it: the numeric id of a login is not a uuid.
   * Null when the row has no GUID.
   */
  actorId: string | null;
}

/**
 * Finds the company of the signed-in account: `users.employee_id` leads to its
 * `pms.employees` row, whose `company` is the text that the KPI tables store.
 * The match is exact: no trimming or case folding.
 */
@Injectable()
export class CompanyResolver {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly employees: EmployeeService,
  ) {}

  async resolveCompany(userId: string): Promise<string> {
    return (await this.resolveAccount(userId)).company;
  }

  async resolveAccount(userId: string): Promise<ResolvedAccount> {
    const user = await this.users.findOne({ where: { id: userId } });
    const employee = user && (await this.employees.findByUser(user));
    if (!employee || employee.company.trim() === '') {
      throw new ForbiddenException(NO_COMPANY);
    }

    return { company: employee.company, actorId: employee.guid ?? null };
  }
}
