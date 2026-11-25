import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { BehavioralTemplate } from '../entities/behavioral-template.entity.js';
import { BehavioralTemplateVersion } from '../entities/behavioral-template-version.entity.js';
import { BehavioralSection } from '../entities/behavioral-section.entity.js';
import { BehavioralQuestion } from '../entities/behavioral-question.entity.js';
import { BehavioralChoiceOption } from '../entities/behavioral-choice-option.entity.js';
import { CreateBehavioralTemplateDto } from '../dtos/create-behavioral-template.dto.js';
import { QuestionDto, SectionDto } from '../dtos/behavioral-section.dto.js';
import { UpdateBehavioralTemplateDto } from '../dtos/update-behavioral-template.dto.js';
import type { TemplateTree } from '../types/template-tree.types.js';
import { CompanyResolver } from '../../kpi-goals/services/company-resolver.service.js';

/** The repositories of one unit of work: the injected ones, or those of a transaction. */
interface Stores {
  templates: Repository<BehavioralTemplate>;
  versions: Repository<BehavioralTemplateVersion>;
  sections: Repository<BehavioralSection>;
  questions: Repository<BehavioralQuestion>;
  options: Repository<BehavioralChoiceOption>;
}

const LOCK_FOR_WRITE = { mode: 'pessimistic_write' } as const;

/** A frozen version needs content: at least one section, and a question in every section. */
function assertPublishable(sections: { questions?: unknown[] }[]): void {
  if (sections.length === 0 || sections.some((section) => (section.questions ?? []).length === 0)) {
    throw new BadRequestException(
      'A published template needs at least one section, and a question in every section.',
    );
  }
}

/**
 * Checks every multiple choice question before any write: two or more options,
 * none blank, none twice. Labels compare trimmed and without case, like the web
 * form: the database `UNIQUE (question_id, label)` compares exact text only.
 */
function assertValidOptions(sections: SectionDto[]): void {
  for (const question of sections.flatMap((section) => section.questions ?? [])) {
    if (question.questionType !== 'multiple_choice') continue;
    const labels = (question.choiceOptions ?? []).map((option) => option.label.trim().toLowerCase());
    if (labels.length < 2) {
      throw new BadRequestException('multiple_choice questions require at least two choice options');
    }
    if (labels.some((label) => label === '')) {
      throw new BadRequestException('A choice option cannot be blank');
    }
    if (new Set(labels).size !== labels.length) {
      throw new BadRequestException('A multiple_choice question cannot have the same option twice');
    }
  }
}

@Injectable()
export class BehavioralAssessmentService {
  constructor(
    @InjectRepository(BehavioralTemplate)
    private readonly templates: Repository<BehavioralTemplate>,
    @InjectRepository(BehavioralTemplateVersion)
    private readonly versions: Repository<BehavioralTemplateVersion>,
    @InjectRepository(BehavioralSection)
    private readonly sections: Repository<BehavioralSection>,
    @InjectRepository(BehavioralQuestion)
    private readonly questions: Repository<BehavioralQuestion>,
    @InjectRepository(BehavioralChoiceOption)
    private readonly options: Repository<BehavioralChoiceOption>,
    private readonly companies: CompanyResolver,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * The company and the actor come from the signed-in account, never from the
   * request: `userId` is the login id, and the actor is the GUID of its employee row.
   */
  async create(
    dto: CreateBehavioralTemplateDto,
    userId: string,
  ): Promise<TemplateTree> {
    assertValidOptions(dto.sections);
    const { company, actorId } = await this.companies.resolveAccount(userId);
    const templateId = randomUUID();
    const versionId = randomUUID();

    await this.inTransaction(async (stores) => {
      await stores.templates.save(
        stores.templates.create({
          templateId,
          company,
          name: dto.name,
          description: dto.description?.trim() || null,
          category: dto.category,
          reviewType: dto.reviewType,
          status: 'draft',
          currentVersion: 1,
          publishedBy: null,
          publishedAt: null,
          archivedAt: null,
        }),
      );
      await stores.versions.save(
        stores.versions.create({
          versionId,
          templateId,
          version: 1,
          frozenAt: null,
          createdBy: actorId,
        }),
      );
      await this.saveSections(dto.sections, versionId, stores);
    });

    return this.findTree(templateId);
  }

  /** A draft may be saved with no content: only a published version needs it. */
  async update(
    templateId: string,
    dto: UpdateBehavioralTemplateDto,
  ): Promise<TemplateTree> {
    assertValidOptions(dto.sections);

    await this.inTransaction(async (stores) => {
      const template = await this.lockTemplate(stores, templateId);
      if (template.status !== 'draft') {
        throw new ConflictException(
          'Only draft templates can be updated. Publish or archive first.',
        );
      }
      const activeVersion = await this.findActiveDraftVersion(stores, templateId);

      if (dto.name !== undefined) template.name = dto.name.trim();
      if (dto.description !== undefined) {
        template.description = dto.description.trim() || null;
      }
      if (dto.category !== undefined) template.category = dto.category;
      if (dto.reviewType !== undefined) template.reviewType = dto.reviewType;
      await stores.templates.save(template);

      await this.clearContent(activeVersion.versionId, stores);
      await this.saveSections(dto.sections, activeVersion.versionId, stores);
    });

    return this.findTree(templateId);
  }

  /** Freezes the draft version. It refuses a draft with no section, or a section with no question. */
  async publish(
    templateId: string,
    userId: string,
  ): Promise<TemplateTree> {
    const { actorId } = await this.companies.resolveAccount(userId);

    await this.inTransaction(async (stores) => {
      const template = await this.lockTemplate(stores, templateId);
      if (template.status !== 'draft') {
        throw new ConflictException(
          'Only draft templates can be published. The template is already ' +
            template.status + '.',
        );
      }
      const activeVersion = await this.findActiveDraftVersion(stores, templateId);

      const sections = await stores.sections.find({
        where: { versionId: activeVersion.versionId },
      });
      const questions = sections.length
        ? await stores.questions.find({
            where: { sectionId: In(sections.map((s) => s.sectionId)) },
          })
        : [];
      assertPublishable(
        sections.map((s) => ({
          questions: questions.filter((q) => q.sectionId === s.sectionId),
        })),
      );

      activeVersion.frozenAt = new Date();
      await stores.versions.save(activeVersion);

      template.status = 'published';
      template.publishedBy = actorId;
      template.publishedAt = new Date();
      await stores.templates.save(template);
    });

    return this.findTree(templateId);
  }

  /**
   * Edits a published template: publishes its next version and keeps the old one
   * as it is, so cycles that already use it do not change. The sections, questions,
   * and options of the new version get new ids, whatever ids the request carries.
   * The template row is locked, so two edits at once get version numbers in turn.
   * It runs in one transaction. Like the KPI route, it does not check that the
   * template belongs to the caller's company.
   */
  async createVersion(
    templateId: string,
    dto: UpdateBehavioralTemplateDto,
    userId: string,
  ): Promise<TemplateTree> {
    assertPublishable(dto.sections);
    assertValidOptions(dto.sections);
    const { actorId } = await this.companies.resolveAccount(userId);

    await this.dataSource.transaction(async (manager) => {
      const template = await manager.findOne(BehavioralTemplate, {
        where: { templateId },
        lock: LOCK_FOR_WRITE,
      });
      if (!template) {
        throw new NotFoundException('Behavioral template not found');
      }
      if (template.status !== 'published') {
        throw new ConflictException(
          'Only a published template gets a new version. Update a draft instead.',
        );
      }

      if (dto.name !== undefined) template.name = dto.name.trim();
      if (dto.description !== undefined) {
        template.description = dto.description.trim() || null;
      }
      if (dto.category !== undefined) template.category = dto.category;
      if (dto.reviewType !== undefined) template.reviewType = dto.reviewType;
      template.currentVersion += 1;
      template.publishedBy = actorId;
      template.publishedAt = new Date();
      await manager.save(template);

      const versionId = randomUUID();
      await manager.save(
        manager.create(BehavioralTemplateVersion, {
          versionId,
          templateId,
          version: template.currentVersion,
          frozenAt: new Date(),
          createdBy: actorId,
        }),
      );
      await this.saveSections(dto.sections, versionId, this.storesOf(manager), true);
    });

    return this.findTree(templateId);
  }

  async getById(templateId: string): Promise<TemplateTree> {
    await this.findTemplate(templateId);
    return this.findTree(templateId);
  }

  async list(): Promise<BehavioralTemplate[]> {
    return this.templates.find({
      order: { updatedAt: 'DESC' },
    });
  }

  // ---- private helpers ------------------------------------------------

  private async findTemplate(templateId: string) {
    const template = await this.templates.findOne({
      where: { templateId },
    });
    if (!template) {
      throw new NotFoundException('Behavioral template not found');
    }
    return template;
  }

  private storesOf(manager: EntityManager): Stores {
    return {
      templates: manager.getRepository(BehavioralTemplate),
      versions: manager.getRepository(BehavioralTemplateVersion),
      sections: manager.getRepository(BehavioralSection),
      questions: manager.getRepository(BehavioralQuestion),
      options: manager.getRepository(BehavioralChoiceOption),
    };
  }

  private inTransaction<T>(run: (stores: Stores) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) => run(this.storesOf(manager)));
  }

  /** Reads the template row with a write lock, so two writers wait for each other. */
  private async lockTemplate(stores: Stores, templateId: string) {
    const template = await stores.templates.findOne({
      where: { templateId },
      lock: LOCK_FOR_WRITE,
    });
    if (!template) {
      throw new NotFoundException('Behavioral template not found');
    }
    return template;
  }

  private async findActiveDraftVersion(stores: Stores, templateId: string) {
    const version = await stores.versions.findOne({
      where: { templateId, frozenAt: IsNull() },
    });
    if (!version) {
      throw new NotFoundException('No active draft version found for template');
    }
    return version;
  }

  private async findTree(templateId: string): Promise<TemplateTree> {
    const template = await this.findTemplate(templateId);
    const version = await this.versions.findOne({
      where: { templateId },
      order: { version: 'DESC' },
    });
    const sections = version
      ? await this.sections.find({
          where: { versionId: version.versionId },
          order: { sortOrder: 'ASC' },
        })
      : [];
    const sectionIds = sections.map((s) => s.sectionId);
    const questions = sectionIds.length
      ? await this.questions.find({
          where: { sectionId: In(sectionIds) },
          order: { sortOrder: 'ASC' },
        })
      : [];
    const questionIds = questions.map((q) => q.questionId);
    const options = questionIds.length
      ? await this.options.find({ where: { questionId: In(questionIds) } })
      : [];

    return { template, version, sections, questions, options };
  }

  /**
   * Saves the sections of a version, with their questions and options. `freshIds`
   * ignores the ids of the request: a new version must not reuse the ids of the
   * version that it follows, because those rows still exist.
   */
  private async saveSections(
    sectionDtos: SectionDto[],
    versionId: string,
    stores: Stores,
    freshIds = false,
  ): Promise<void> {
    for (const [index, sectionDto] of sectionDtos.entries()) {
      const sectionId = freshIds ? randomUUID() : (sectionDto.sectionId ?? randomUUID());

      const section = stores.sections.create({
        sectionId,
        versionId,
        title: sectionDto.title,
        sortOrder: sectionDto.sortOrder ?? index,
      });
      await stores.sections.save(section);

      await this.saveQuestions(sectionDto.questions ?? [], sectionId, stores, freshIds);
    }
  }

  private async saveQuestions(
    questionDtos: QuestionDto[],
    sectionId: string,
    stores: Stores,
    freshIds: boolean,
  ): Promise<void> {
    for (const [index, questionDto] of questionDtos.entries()) {
      const questionId = freshIds ? randomUUID() : (questionDto.questionId ?? randomUUID());
      const allowNotObserved =
        questionDto.questionType === 'rating_scale'
          ? questionDto.allowNotObserved ?? false
          : null;

      const question = stores.questions.create({
        questionId,
        sectionId,
        prompt: questionDto.prompt,
        questionType: questionDto.questionType,
        isRequired: questionDto.isRequired ?? true,
        allowNotObserved,
        sortOrder: questionDto.sortOrder ?? index,
      });
      await stores.questions.save(question);

      // Only a multiple choice question has options: the check above covers no other type.
      const optionDtos =
        questionDto.questionType === 'multiple_choice' ? (questionDto.choiceOptions ?? []) : [];
      const options = optionDtos.map((o) =>
        stores.options.create({
          optionId: randomUUID(),
          questionId,
          label: o.label,
        }),
      );
      if (options.length) {
        await stores.options.save(options);
      }
    }
  }

  private async clearContent(versionId: string, stores: Stores): Promise<void> {
    const sectionEntities = await stores.sections.find({
      where: { versionId },
    });
    if (!sectionEntities.length) {
      return;
    }
    const sectionIds = sectionEntities.map((s) => s.sectionId);
    const questionEntities = await stores.questions.find({
      where: { sectionId: In(sectionIds) },
    });
    const questionIds = questionEntities.map((q) => q.questionId);

    if (questionIds.length) {
      await stores.options.delete({ questionId: In(questionIds) });
      await stores.questions.delete({ sectionId: In(sectionIds) });
    }
    await stores.sections.delete({ sectionId: In(sectionIds) });
  }
}
