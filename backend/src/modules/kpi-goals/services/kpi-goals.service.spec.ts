import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { idSchema } from "@pms/shared-types";
import type { DataSource, EntityManager, Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateKpiGoalTemplateDto } from "../dtos/create-kpi-goal-template.dto.js";
import type { IndicatorDto } from "../dtos/kpi-indicator.dto.js";
import { KpiGoalTemplate } from "../entities/kpi-goal-template.entity.js";
import { KpiIndicatorMatrixCell } from "../entities/kpi-indicator-matrix-cell.entity.js";
import { KpiIndicatorMatrixColumn } from "../entities/kpi-indicator-matrix-column.entity.js";
import { KpiIndicatorMatrixRow } from "../entities/kpi-indicator-matrix-row.entity.js";
import { KpiIndicatorScale } from "../entities/kpi-indicator-scale.entity.js";
import { KpiIndicator } from "../entities/kpi-indicator.entity.js";
import { KpiTemplateVersion } from "../entities/kpi-template-version.entity.js";
import type { CompanyResolver } from "./company-resolver.service.js";
import { KpiGoalsService } from "./kpi-goals.service.js";

const COMPANY = "Example Company";
const TEMPLATE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const VERSION_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3302";
// The employee GUID of the account. The user id of a login is a number, not a UUID.
const ACTOR_ID = "00000000-0000-0000-0000-000000000021";

function indicator(overrides: Partial<IndicatorDto> = {}): IndicatorDto {
  return {
    name: "Sales",
    direction: "higher_is_better",
    weight: 100,
    scoreTargetMet: 5,
    scoreBelowTarget: 2,
    ...overrides,
  } as IndicatorDto;
}

function createDto(indicators: IndicatorDto[]): CreateKpiGoalTemplateDto {
  return {
    name: "Software Engineer Performance Goals",
    description: "Position targets",
    position: "Software Engineer",
    indicators,
  };
}

function repository() {
  return {
    create: vi.fn((value: object) => value),
    save: vi.fn(async (value: unknown) => value),
    delete: vi.fn(),
    find: vi.fn(async (): Promise<unknown[]> => []),
    findOne: vi.fn(),
  };
}

describe("KpiGoalsService writes", () => {
  const repos = {
    templates: repository(),
    versions: repository(),
    indicators: repository(),
    scales: repository(),
    matrixRows: repository(),
    matrixColumns: repository(),
    cells: repository(),
  };
  const manager = {
    create: vi.fn((_entity: unknown, value: object) => value),
    save: vi.fn(async (value: unknown) => value),
    delete: vi.fn(),
    find: vi.fn(async (): Promise<unknown[]> => []),
    findOne: vi.fn(),
    query: vi.fn(),
  };
  const transaction = vi.fn(async (work: (m: EntityManager) => Promise<unknown>) =>
    work(manager as unknown as EntityManager),
  );
  // Reads outside a transaction go through `dataSource.manager`.
  const readManager = { findOne: vi.fn(), query: vi.fn() };
  const resolver = { resolveCompany: vi.fn(), resolveAccount: vi.fn() };
  let service: KpiGoalsService;

  function asRepo(repo: ReturnType<typeof repository>) {
    return repo as unknown as Repository<never>;
  }

  beforeEach(() => {
    for (const repo of Object.values(repos)) {
      for (const fn of Object.values(repo)) fn.mockClear();
    }
    for (const fn of Object.values(manager)) fn.mockReset();
    transaction.mockClear();
    readManager.query.mockReset().mockResolvedValue([{ ok: 1 }]);
    manager.query.mockResolvedValue([{ ok: 1 }]);
    resolver.resolveCompany.mockReset().mockResolvedValue(COMPANY);
    resolver.resolveAccount.mockReset().mockResolvedValue({ company: COMPANY, actorId: ACTOR_ID });
    readManager.findOne.mockReset();
    readManager.findOne.mockResolvedValue({ templateId: TEMPLATE_ID });
    repos.versions.findOne.mockResolvedValue(null);
    service = new KpiGoalsService(
      asRepo(repos.templates),
      asRepo(repos.versions),
      asRepo(repos.indicators),
      asRepo(repos.scales),
      asRepo(repos.matrixRows),
      asRepo(repos.matrixColumns),
      asRepo(repos.cells),
      { transaction, manager: readManager } as unknown as DataSource,
      resolver as unknown as CompanyResolver,
    );
  });

  function expectNoRepositoryWrites() {
    for (const repo of Object.values(repos)) {
      expect(repo.save).not.toHaveBeenCalled();
      expect(repo.delete).not.toHaveBeenCalled();
    }
  }

  it("rejects bad scores before it opens a transaction or writes a row", async () => {
    const bad = indicator({ scoreTargetMet: 1, scoreBelowTarget: 4 });

    await expect(service.create(createDto([bad]), "user-1")).rejects.toThrow(
      BadRequestException,
    );

    expect(transaction).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
    expectNoRepositoryWrites();
  });

  it("rejects a percentage target above 100 before it writes", async () => {
    const bad = indicator({ unit: "Percentage", target: 120 });

    await expect(service.create(createDto([bad]), "user-1")).rejects.toThrow(BadRequestException);

    expect(transaction).not.toHaveBeenCalled();
  });

  it("accepts a target above 100 for another unit", async () => {
    await service.create(createDto([indicator({ unit: "Count", target: 120 })]), "user-1");

    expect(transaction).toHaveBeenCalled();
  });

  it("writes the template, version, and indicators through one transaction", async () => {
    await service.create(createDto([indicator()]), "user-1");

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledTimes(3);
    expectNoRepositoryWrites();
  });

  it("stores the company text of the account and a missing position as null", async () => {
    await service.create(createDto([indicator()]), "user-1");
    await service.create({ ...createDto([indicator()]), position: null }, "user-1");

    const templates = manager.create.mock.calls
      .filter(([entity]) => entity === KpiGoalTemplate)
      .map(([, value]) => value);
    expect(templates[0]).toMatchObject({ company: COMPANY, position: "Software Engineer" });
    expect(templates[1]).toMatchObject({ company: COMPANY, position: null });
  });

  it("stores the name and the description, and null for a blank description", async () => {
    await service.create(createDto([indicator()]), "user-1");
    await service.create({ ...createDto([indicator()]), description: "  " }, "user-1");

    const templates = manager.create.mock.calls
      .filter(([entity]) => entity === KpiGoalTemplate)
      .map(([, value]) => value);
    expect(templates[0]).toMatchObject({
      name: "Software Engineer Performance Goals",
      description: "Position targets",
    });
    expect(templates[1]).toMatchObject({ description: null });
  });

  it("records the employee GUID of the creator on the version, never the numeric user id", async () => {
    await service.create(createDto([indicator()]), "4");

    const [, version] = manager.create.mock.calls.find(([type]) => type === KpiTemplateVersion)!;
    const { createdBy } = version as { createdBy: string };
    expect(createdBy).toBe(ACTOR_ID);
    expect(idSchema.safeParse(createdBy).success).toBe(true);
    expect(resolver.resolveAccount).toHaveBeenCalledWith("4");
  });

  it("stores no creator when the employee row has no GUID, and still saves", async () => {
    resolver.resolveAccount.mockResolvedValue({ company: COMPANY, actorId: null });

    await service.create(createDto([indicator()]), "4");

    const version = manager.create.mock.calls.find(([type]) => type === KpiTemplateVersion);
    expect(version?.[1]).toMatchObject({ createdBy: null });
  });

  it("reads the new template only after the transaction commits", async () => {
    await service.create(createDto([indicator()]), "user-1");

    const commit = transaction.mock.invocationCallOrder[0] ?? 0;
    const read = readManager.findOne.mock.invocationCallOrder[0] ?? 0;
    expect(read).toBeGreaterThan(commit);
  });

  it("rejects an update to a non-draft template without a write", async () => {
    manager.findOne.mockResolvedValueOnce({
      templateId: TEMPLATE_ID,
      status: "published",
    });

    await expect(
      service.update(TEMPLATE_ID, { name: "Renamed", position: "Software Engineer", indicators: [indicator()] }),
    ).rejects.toThrow(ConflictException);

    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
    expectNoRepositoryWrites();
  });

  it("clears and rewrites a draft inside one transaction", async () => {
    manager.findOne
      .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft" })
      .mockResolvedValueOnce({ versionId: VERSION_ID });
    manager.find.mockResolvedValueOnce([{ indicatorId: "old" }] as never);

    await service.update(TEMPLATE_ID, { name: "Renamed", description: "", position: "Software Engineer", indicators: [indicator()] });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.delete).toHaveBeenCalled();
    expect(manager.save).toHaveBeenCalled();
    expectNoRepositoryWrites();
  });

  it("saves the new name and description of a draft", async () => {
    const template = { templateId: TEMPLATE_ID, status: "draft", name: "Old", description: "Old text" };
    manager.findOne
      .mockResolvedValueOnce(template)
      .mockResolvedValueOnce({ versionId: VERSION_ID });

    await service.update(TEMPLATE_ID, {
      name: "Renamed",
      description: "",
      indicators: [indicator()],
    });

    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ templateId: TEMPLATE_ID, name: "Renamed", description: null }),
    );
  });

  it("publishes as the employee GUID of the account, never the numeric user id", async () => {
    const template = { templateId: TEMPLATE_ID, status: "draft" } as Record<string, unknown>;
    manager.findOne
      .mockResolvedValueOnce(template)
      .mockResolvedValueOnce({ versionId: VERSION_ID, frozenAt: null });
    manager.find.mockResolvedValueOnce([{ indicatorId: "i-1", weight: "100.00" }] as never);

    await service.publish(TEMPLATE_ID, "4");

    expect(template.publishedBy).toBe(ACTOR_ID);
    expect(idSchema.safeParse(template.publishedBy).success).toBe(true);
    expect(resolver.resolveAccount).toHaveBeenCalledWith("4");
  });

  it("freezes the version and publishes the template in one transaction", async () => {
    manager.findOne
      .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft" })
      .mockResolvedValueOnce({ versionId: VERSION_ID, frozenAt: null });
    manager.find.mockResolvedValueOnce([{ indicatorId: "i-1", weight: "100.00" }] as never);

    await service.publish(TEMPLATE_ID, "user-1");

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledTimes(2);
    expectNoRepositoryWrites();
  });

  it("sets the company from the account, not from the request", async () => {
    await service.create(createDto([indicator()]), "user-1");

    expect(resolver.resolveAccount).toHaveBeenCalledWith("user-1");
  });

  it("refuses a position that no employee of the company holds, before any write", async () => {
    readManager.query.mockResolvedValue([]);

    await expect(service.create(createDto([indicator()]), "user-1")).rejects.toThrow(
      BadRequestException,
    );

    expect(transaction).not.toHaveBeenCalled();
    expectNoRepositoryWrites();
  });

  it("skips the position check for a company-wide template", async () => {
    await service.create({ ...createDto([indicator()]), position: null }, "user-1");

    expect(readManager.query).not.toHaveBeenCalled();
  });

  it("keeps a draft's unchanged position even when no employee holds it any more", async () => {
    manager.findOne
      .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft", company: COMPANY, position: "Retired Role" })
      .mockResolvedValueOnce({ versionId: VERSION_ID });
    manager.query.mockResolvedValueOnce([]);

    await service.update(TEMPLATE_ID, { name: "Renamed", position: "Retired Role", indicators: [indicator()] });

    expect(manager.query).not.toHaveBeenCalledWith(expect.stringContaining("pms.employees"), expect.anything());
    expect(manager.save).toHaveBeenCalled();
  });

  it("refuses to move a draft to a position that no employee of the company holds", async () => {
    manager.findOne
      .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft", company: COMPANY, position: "Software Engineer" })
      .mockResolvedValueOnce({ versionId: VERSION_ID });
    manager.query.mockResolvedValueOnce([]);

    await expect(
      service.update(TEMPLATE_ID, { name: "Renamed", position: "Unknown", indicators: [indicator()] }),
    ).rejects.toThrow(BadRequestException);

    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it("lists templates with their position text and the indicator count, with no join to a positions table", async () => {
    readManager.query.mockResolvedValue([
      {
        template_id: TEMPLATE_ID,
        position: "Software Engineer",
        company: COMPANY,
        status: "published",
        current_version: 2,
        published_by: null,
        published_at: null,
        archived_at: null,
        created_at: "2026-11-01T00:00:00.000Z",
        updated_at: "2026-11-05T00:00:00.000Z",
        name: "Software Engineer Performance Goals",
        description: null,
        indicator_count: "3",
      },
    ]);

    const [item] = await service.list();

    expect(item).toMatchObject({
      templateId: TEMPLATE_ID,
      position: "Software Engineer",
      company: COMPANY,
      status: "published",
      currentVersion: 2,
      name: "Software Engineer Performance Goals",
      description: null,
      indicatorCount: 3,
    });
    expect(readManager.query).toHaveBeenCalledTimes(1);
    expect(readManager.query.mock.calls[0]?.[0]).not.toContain("pms.positions");
  });

  it("lists the positions of the account's company", async () => {
    readManager.query.mockResolvedValue([{ position: "Software Engineer" }]);

    await expect(service.listPositions("user-1")).resolves.toEqual(["Software Engineer"]);
    expect(readManager.query).toHaveBeenCalledWith(expect.stringContaining("pms.employees"), [COMPANY]);
  });

  describe("a new version of a published template", () => {
    const OLD_INDICATOR_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3399";
    const published = () => ({
      templateId: TEMPLATE_ID,
      status: "published",
      currentVersion: 2,
      company: COMPANY,
    });
    const previous = [
      { indicatorId: OLD_INDICATOR_ID, unit: "Percentage", direction: "higher_is_better" },
    ];
    const body = (overrides: Partial<IndicatorDto> = {}) => ({
      name: "Renamed",
      description: "",
      position: "Software Engineer",
      indicators: [
        indicator({
          indicatorId: OLD_INDICATOR_ID,
          unit: "Percentage",
          direction: "higher_is_better",
          weight: 100,
          ...overrides,
        }),
      ],
    });
    const arrange = (template: Record<string, unknown> = published()) => {
      manager.findOne
        .mockResolvedValueOnce(template)
        .mockResolvedValueOnce({ versionId: VERSION_ID, version: 2 });
      manager.find.mockResolvedValueOnce(previous as never);
    };
    const created = (entity: unknown) =>
      manager.create.mock.calls.filter(([type]) => type === entity).map(([, value]) => value);

    it("locks the template row, and refuses a template that is not published", async () => {
      arrange({ ...published(), status: "draft" });

      await expect(service.createVersion(TEMPLATE_ID, body(), "4")).rejects.toThrow(ConflictException);

      expect(manager.findOne.mock.calls[0]?.[1]).toMatchObject({
        lock: { mode: "pessimistic_write" },
      });
      expect(manager.save).not.toHaveBeenCalled();
    });

    it("publishes version 3 at once, as the employee GUID, and keeps the old version untouched", async () => {
      arrange();

      await service.createVersion(TEMPLATE_ID, body(), "4");

      expect(created(KpiTemplateVersion)).toMatchObject([
        { version: 3, createdBy: ACTOR_ID },
      ]);
      const [version] = created(KpiTemplateVersion) as { frozenAt: Date | null }[];
      expect(version?.frozenAt).toBeInstanceOf(Date);
      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: TEMPLATE_ID,
          name: "Renamed",
          currentVersion: 3,
          status: "published",
          publishedBy: ACTOR_ID,
        }),
      );
      expect(manager.delete).not.toHaveBeenCalled();
    });

    it("gives the indicators of the new version new ids: the old rows stay", async () => {
      arrange();

      await service.createVersion(TEMPLATE_ID, body(), "4");

      const [indicatorRow] = created(KpiIndicator) as { indicatorId: string }[];
      expect(indicatorRow?.indicatorId).not.toBe(OLD_INDICATOR_ID);
      expect(idSchema.safeParse(indicatorRow?.indicatorId).success).toBe(true);
    });

    it.each([
      ["the measurement unit", { unit: "Count" }],
      ["the achievement direction", { direction: "lower_is_better" as const }],
    ])("refuses to change %s of an indicator that is already published", async (_label, change) => {
      arrange();

      await expect(
        service.createVersion(TEMPLATE_ID, body(change), "4"),
      ).rejects.toThrow(/Indicator 1: .*cannot change/);

      expect(manager.save).not.toHaveBeenCalled();
    });

    it("lets a new indicator choose its own unit and direction", async () => {
      arrange();
      const added = indicator({ unit: "Count", direction: "lower_is_better", weight: 50 });
      const kept = body({ weight: 50 });

      await service.createVersion(TEMPLATE_ID, { ...kept, indicators: [...kept.indicators, added] }, "4");

      expect(created(KpiIndicator)).toHaveLength(2);
    });

    it("refuses weights that do not total 100 before it opens a transaction", async () => {
      await expect(
        service.createVersion(TEMPLATE_ID, body({ weight: 60 }), "4"),
      ).rejects.toThrow(/total 100/);

      expect(transaction).not.toHaveBeenCalled();
    });

    it("refuses a version with no indicators", async () => {
      await expect(
        service.createVersion(TEMPLATE_ID, { ...body(), indicators: [] }, "4"),
      ).rejects.toThrow(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    });

    it("refuses a position that no employee of the company holds", async () => {
      arrange();
      manager.query.mockResolvedValueOnce([]);

      await expect(service.createVersion(TEMPLATE_ID, body(), "4")).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  it("refuses to publish a draft whose weights do not total 100", async () => {
    manager.findOne
      .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft" })
      .mockResolvedValueOnce({ versionId: VERSION_ID, frozenAt: null });
    manager.find.mockResolvedValueOnce([{ indicatorId: "i-1", weight: "60.00" }] as never);

    await expect(service.publish(TEMPLATE_ID, "4")).rejects.toThrow(/total 100/);

    expect(manager.save).not.toHaveBeenCalled();
  });

  describe("indicator matrix", () => {
    const scaleIndicator = (overrides: Partial<IndicatorDto> = {}) =>
      indicator({
        matrixKind: "scale",
        matrixTitle: "Numeric threshold scale",
        scaleBound: "minimum",
        useForScoring: true,
        scales: [
          { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
          { lowerBound: 90, upperBound: null, label: "Target met", score: 3.5 },
        ],
        ...overrides,
      });

    const created = (entity: unknown) =>
      manager.create.mock.calls.filter(([type]) => type === entity).map(([, value]) => value);

    it("rejects an invalid matrix before it opens a transaction, and names the indicator", async () => {
      const bad = scaleIndicator({ scales: [] });

      await expect(service.create(createDto([indicator(), bad]), "user-1")).rejects.toThrow(
        /Indicator 2:/,
      );

      expect(transaction).not.toHaveBeenCalled();
      expectNoRepositoryWrites();
    });

    it("rejects scoring from a reference table", async () => {
      const bad = indicator({
        matrixKind: "table",
        matrixTitle: "Reference matrix",
        useForScoring: true,
        matrixColumns: [{ label: "A" }],
        matrixRows: [{ cells: ["x"] }],
      });

      await expect(service.create(createDto([bad]), "user-1")).rejects.toThrow(
        /Only numeric threshold scales/,
      );
      expect(transaction).not.toHaveBeenCalled();
    });

    it("writes the kind, the title, the threshold type and the scoring flag of the indicator", async () => {
      await service.create(createDto([scaleIndicator()]), "user-1");

      expect(created(KpiIndicator)[0]).toMatchObject({
        matrixKind: "scale",
        matrixTitle: "Numeric threshold scale",
        scaleBound: "minimum",
        useForScoring: true,
      });
    });

    it("defaults an indicator to no matrix and reference only", async () => {
      await service.create(createDto([indicator()]), "user-1");

      expect(created(KpiIndicator)[0]).toMatchObject({
        matrixKind: "none",
        matrixTitle: null,
        scaleBound: null,
        useForScoring: false,
      });
    });

    it("writes one row per threshold, with its label and its decimal score", async () => {
      await service.create(createDto([scaleIndicator()]), "user-1");

      expect(created(KpiIndicatorScale)).toMatchObject([
        { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
        { lowerBound: 90, upperBound: null, label: "Target met", score: 3.5 },
      ]);
    });

    it("writes a reference table: ordered columns and rows, and one cell for each", async () => {
      const table = indicator({
        matrixKind: "table",
        matrixTitle: "Reference matrix",
        matrixColumns: [{ label: "Criteria" }, { label: "Guidance" }],
        matrixRows: [{ cells: ["Quality", "No defects"] }, { cells: ["Speed", "On time"] }],
      });

      await service.create(createDto([table]), "user-1");

      expect(created(KpiIndicatorMatrixColumn)).toMatchObject([
        { colLabel: "Criteria", position: 0 },
        { colLabel: "Guidance", position: 1 },
      ]);
      expect(created(KpiIndicatorMatrixRow)).toMatchObject([{ position: 0 }, { position: 1 }]);
      const cells = created(KpiIndicatorMatrixCell) as { rowId: string; colId: string; value: string }[];
      expect(cells.map((cell) => cell.value)).toEqual(["Quality", "No defects", "Speed", "On time"]);
      const columnIds = new Set(
        (created(KpiIndicatorMatrixColumn) as { colId: string }[]).map((column) => column.colId),
      );
      expect(cells.every((cell) => columnIds.has(cell.colId))).toBe(true);
      expectNoRepositoryWrites();
    });

    it("clears the cells before the rows and columns they belong to, when a draft is updated", async () => {
      manager.findOne
        .mockResolvedValueOnce({ templateId: TEMPLATE_ID, status: "draft" })
        .mockResolvedValueOnce({ versionId: VERSION_ID });
      manager.find.mockResolvedValueOnce([{ indicatorId: "old" }] as never);

      await service.update(TEMPLATE_ID, {
        name: "Renamed",
        indicators: [indicator()],
      });

      const cellDelete = manager.query.mock.calls.findIndex(([sql]) =>
        String(sql).includes("DELETE FROM pms.kpi_indicator_matrix_cells"),
      );
      expect(cellDelete).toBeGreaterThanOrEqual(0);
      const rowDelete = manager.delete.mock.calls.findIndex(([type]) => type === KpiIndicatorMatrixRow);
      expect(manager.query.mock.invocationCallOrder[cellDelete]).toBeLessThan(
        manager.delete.mock.invocationCallOrder[rowDelete] ?? Infinity,
      );
    });

    it("returns the cells of a template with its tree", async () => {
      repos.versions.findOne.mockResolvedValue({ versionId: VERSION_ID });
      repos.indicators.find.mockResolvedValue([{ indicatorId: "i-1" }]);
      repos.matrixRows.find.mockResolvedValue([{ rowId: "r-1" }]);
      repos.cells.find.mockResolvedValue([{ rowId: "r-1", colId: "c-1", value: "x" }]);

      const tree = await service.getById(TEMPLATE_ID);

      expect(tree.matrixCells).toEqual([{ rowId: "r-1", colId: "c-1", value: "x" }]);
    });
  });

  it("returns not found when a template read finds nothing", async () => {
    readManager.findOne.mockResolvedValue(null);

    await expect(service.getById(TEMPLATE_ID)).rejects.toThrow(NotFoundException);
  });

  it("refuses to archive a template that is already archived", async () => {
    readManager.findOne.mockResolvedValue({ templateId: TEMPLATE_ID, status: "archived" });

    await expect(service.archive(TEMPLATE_ID)).rejects.toThrow(ConflictException);
    expect(repos.templates.save).not.toHaveBeenCalled();
  });
});
