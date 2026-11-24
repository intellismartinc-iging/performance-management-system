import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
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

/** The repositories that save the content of a version: the injected ones, or those of a transaction. */
interface ContentStores {
  sections: Repository<BehavioralSection>;
  questions: Repository<BehavioralQuestion>;
  options: Repository<BehavioralChoiceOption>;
}

/** A frozen version needs content: at least one section, and a question in every section. */
function assertPublishable(sections: SectionDto[]): void {
  if (sections.length === 0 || sections.some((section) => (section.questions ?? []).length === 0)) {
    throw new BadRequestException(
      'A published template needs at least one section, and a question in every section.',
    );
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
    const { company, actorId } = await this.companies.resolveAccount(userId);
    const templateId = randomUUID();
    const versionId = randomUUID();

    const template = this.templates.create({
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
    });
    await this.templates.save(template);

    const version = this.versions.create({
      versionId,
      templateId,
      version: 1,
      frozenAt: null,
      createdBy: actorId,
    });
    await this.versions.save(version);

    await this.saveSections(dto.sections, versionId);

    return this.findTree(templateId);
  }

  async update(
    templateId: string,
    dto: UpdateBehavioralTemplateDto,
  ): Promise<TemplateTree> {
    const template = await this.findTemplate(templateId);
    if (template.status !== 'draft') {
      throw new ConflictException(
        'Only draft templates can be updated. Publish or archive first.',
      );
    }

    const activeVersion = await this.findActiveDraftVersion(templateId);
    if (!activeVersion) {
      throw new NotFoundException('No active draft version found for template');
    }

    if (dto.name !== undefined) template.name = dto.name.trim();
    if (dto.description !== undefined) {
      template.description = dto.description.trim() || null;
    }
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.reviewType !== undefined) template.reviewType = dto.reviewType;
    await this.templates.save(template);

    await this.clearContent(activeVersion.versionId);
    await this.saveSections(dto.sections, activeVersion.versionId);

    return this.findTree(templateId);
  }

  async publish(
    templateId: string,
    userId: string,
  ): Promise<TemplateTree> {
    const { actorId } = await this.companies.resolveAccount(userId);
    const template = await this.findTemplate(templateId);
    if (template.status !== 'draft') {
      throw new ConflictException(
        'Only draft templates can be published. The template is already ' +
          template.status + '.',
      );
    }

    const activeVersion = await this.findActiveDraftVersion(templateId);
    if (!activeVersion) {
      throw new NotFoundException('No active draft version found for template');
    }

    activeVersion.frozenAt = new Date();
    await this.versions.save(activeVersion);

    template.status = 'published';
    template.publishedBy = actorId;
    template.publishedAt = new Date();
    await this.templates.save(template);

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
    const { actorId } = await this.companies.resolveAccount(userId);

    await this.dataSource.transaction(async (manager) => {
      const template = await manager.findOne(BehavioralTemplate, {
        where: { templateId },
        lock: { mode: 'pessimistic_write' },
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
      await this.saveSections(
        dto.sections,
        versionId,
        {
          sections: manager.getRepository(BehavioralSection),
          questions: manager.getRepository(BehavioralQuestion),
          options: manager.getRepository(BehavioralChoiceOption),
        },
        true,
      );
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

  private async findActiveDraftVersion(templateId: string) {
    return this.versions
      .findOne({ where: { templateId, frozenAt: IsNull() } })
      .catch(() => null);
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
    stores: ContentStores = {
      sections: this.sections,
      questions: this.questions,
      options: this.options,
    },
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
    stores: ContentStores,
    freshIds: boolean,
  ): Promise<void> {
    for (const [index, questionDto] of questionDtos.entries()) {
      if (
        questionDto.questionType === 'multiple_choice' &&
        (!questionDto.choiceOptions || questionDto.choiceOptions.length < 2)
      ) {
        throw new BadRequestException(
          'multiple_choice questions require at least two choice options',
        );
      }

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

      const options = (questionDto.choiceOptions ?? []).map((o) =>
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

  private async clearContent(versionId: string): Promise<void> {
    const sectionEntities = await this.sections.find({
      where: { versionId },
    });
    if (!sectionEntities.length) {
      return;
    }
    const sectionIds = sectionEntities.map((s) => s.sectionId);
    const questionEntities = await this.questions.find({
      where: { sectionId: In(sectionIds) },
    });
    const questionIds = questionEntities.map((q) => q.questionId);

    if (questionIds.length) {
      await this.options.delete({ questionId: In(questionIds) });
    }
    if (questionIds.length) {
      await this.questions.delete({ sectionId: In(sectionIds) });
    }
    await this.sections.delete({ sectionId: In(sectionIds) });
  }
}
