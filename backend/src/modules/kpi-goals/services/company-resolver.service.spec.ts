import { ForbiddenException } from "@nestjs/common";
import type { DataSource, Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../auth/entities/user.entity.js";
import type { EmployeeService } from "../../employees/services/employee.service.js";
import { CompanyResolver } from "./company-resolver.service.js";

const USER = { id: "user-1", employeeId: "5" };
const GUID = "00000000-0000-0000-0000-000000000021";

describe("CompanyResolver", () => {
  const findUser = vi.fn();
  const findByUser = vi.fn();
  const query = vi.fn();
  let resolver: CompanyResolver;

  beforeEach(() => {
    findUser.mockReset().mockResolvedValue(USER);
    findByUser.mockReset().mockResolvedValue({ employeeCode: "EMP-001", hrdotnetId: "1" });
    query.mockReset().mockResolvedValue([{ company_id: "1" }]);
    resolver = new CompanyResolver(
      { findOne: findUser } as unknown as Repository<User>,
      { findByUser } as unknown as EmployeeService,
      { manager: { query } } as unknown as DataSource,
    );
  });

  it("maps the account to a company through the HRDotNet id", async () => {
    await expect(resolver.resolveCompanyId("user-1")).resolves.toBe(1);

    expect(query).toHaveBeenCalledWith(expect.stringContaining("hrdotnet_id"), ["1"]);
  });

  it("falls back to the employee code when there is no HRDotNet id", async () => {
    findByUser.mockResolvedValue({ employeeCode: "EMP-001", hrdotnetId: null });

    await resolver.resolveCompanyId("user-1");

    expect(query).toHaveBeenCalledWith(expect.stringContaining("code"), ["EMP-001"]);
  });

  it("tries the employee code when the HRDotNet id finds no row", async () => {
    query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ company_id: "1" }]);

    await expect(resolver.resolveCompanyId("user-1")).resolves.toBe(1);

    expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining("hrdotnet_id"), ["1"]);
    expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("code"), ["EMP-001"]);
  });

  describe("resolveAccount", () => {
    it("returns the company and the GUID of the employee row: the actor of a write", async () => {
      query.mockResolvedValue([{ company_id: "1", guid: GUID }]);

      await expect(resolver.resolveAccount("user-1")).resolves.toEqual({
        companyId: 1,
        actorId: GUID,
      });
    });

    it("returns no actor when the employee row has no GUID", async () => {
      query.mockResolvedValue([{ company_id: "1", guid: null }]);

      await expect(resolver.resolveAccount("user-1")).resolves.toEqual({
        companyId: 1,
        actorId: null,
      });
    });

    it("returns no actor when two employee rows of one company match", async () => {
      query.mockResolvedValue([
        { company_id: "1", guid: GUID },
        { company_id: "1", guid: "00000000-0000-0000-0000-000000000022" },
      ]);

      await expect(resolver.resolveAccount("user-1")).resolves.toEqual({
        companyId: 1,
        actorId: null,
      });
    });

    it("keeps the rule that one account belongs to one company", async () => {
      query.mockResolvedValue([
        { company_id: "1", guid: GUID },
        { company_id: "2", guid: GUID },
      ]);

      await expect(resolver.resolveAccount("user-1")).rejects.toThrow(ForbiddenException);
    });
  });

  it.each([
    ["no user row", () => findUser.mockResolvedValue(null)],
    ["no employee row", () => findByUser.mockResolvedValue(null)],
    ["no pms.employees row", () => query.mockResolvedValue([])],
    ["more than one company", () => query.mockResolvedValue([{ company_id: "1" }, { company_id: "2" }])],
  ])("refuses with %s", async (_label, arrange) => {
    arrange();

    await expect(resolver.resolveCompanyId("user-1")).rejects.toThrow(ForbiddenException);
  });
});
