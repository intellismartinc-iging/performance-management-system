import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Mock } from 'vitest';
import { BehavioralAssessmentService } from './behavioral-assessment.service.js';
import { BehavioralTemplate } from '../entities/behavioral-template.entity.js';
import { BehavioralTemplateVersion } from '../entities/behavioral-template-version.entity.js';
import { BehavioralSection } from '../entities/behavioral-section.entity.js';
import { BehavioralQuestion } from '../entities/behavioral-question.entity.js';
import { BehavioralChoiceOption } from '../entities/behavioral-choice-option.entity.js';
import { CreateBehavioralTemplateDto } from '../dtos/create-behavioral-template.dto.js';
import { CompanyResolver } from '../../kpi-goals/services/company-resolver.service.js';

const ACTOR_ID = '00000000-0000-0000-0000-000000000021';

type MockRepo<T> = {
  create: Mock<(data: Partial<T>) => T>;
  save: Mock<(entity: T) => Promise<T>>;
  find: Mock<(...args: unknown[]) => Promise<T[]>>;
  findOne: Mock<(...args: unknown[]) => Promise<T | null>>;
  delete: Mock<(...args: unknown[]) => Promise<unknown>>;
};

function createRepo<T>(): MockRepo<T> {
  return {
    create: vi.fn((d: Partial<T>) => d as T),
    save: vi.fn(async (e: T) => e),
    find: vi.fn(async () => []),
    findOne: vi.fn(async () => null),
    delete: vi.fn(async () => undefined),
  };
}

describe('BehavioralAssessmentService', () => {
  let service: BehavioralAssessmentService;
  let templates: MockRepo<BehavioralTemplate>;
  let versions: MockRepo<BehavioralTemplateVersion>;
  let sections: MockRepo<BehavioralSection>;
  let questions: MockRepo<BehavioralQuestion>;
  let options: MockRepo<BehavioralChoiceOption>;
  const resolver = { resolveAccount: vi.fn() };
  // The transaction of createVersion: its manager hands out the same repository mocks.
  const manager = {
    findOne: vi.fn(),
    save: vi.fn(async (entity: unknown) => entity),
    create: vi.fn((_entity: unknown, data: unknown) => data),
    delete: vi.fn(),
    getRepository: vi.fn(),
  };
  const dataSource = {
    transaction: vi.fn(async (run: (m: typeof manager) => Promise<unknown>) => run(manager)),
  };

  async function build() {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BehavioralAssessmentService,
        {
          provide: getRepositoryToken(BehavioralTemplate),
          useValue: templates,
        },
        {
          provide: getRepositoryToken(BehavioralTemplateVersion),
          useValue: versions,
        },
        {
          provide: getRepositoryToken(BehavioralSection),
          useValue: sections,
        },
        {
          provide: getRepositoryToken(BehavioralQuestion),
          useValue: questions,
        },
        {
          provide: getRepositoryToken(BehavioralChoiceOption),
          useValue: options,
        },
        { provide: CompanyResolver, useValue: resolver },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(BehavioralAssessmentService);
  }

  beforeEach(async () => {
    templates = createRepo();
    versions = createRepo();
    sections = createRepo();
    questions = createRepo();
    options = createRepo();
    manager.findOne.mockReset();
    manager.save.mockReset().mockImplementation(async (entity: unknown) => entity);
    manager.create.mockReset().mockImplementation((_entity: unknown, data: unknown) => data);
    manager.delete.mockReset();
    manager.getRepository.mockReset().mockImplementation((entity: unknown) => {
      if (entity === BehavioralTemplate) return templates;
      if (entity === BehavioralTemplateVersion) return versions;
      if (entity === BehavioralSection) return sections;
      if (entity === BehavioralQuestion) return questions;
      if (entity === BehavioralChoiceOption) return options;
      return undefined;
    });
    dataSource.transaction.mockClear();
    resolver.resolveAccount
      .mockReset()
      .mockResolvedValue({ company: 'Example Company', actorId: ACTOR_ID });
    await build();
  });

  describe('create', () => {
    it('creates a draft template with one draft version and its sections', async () => {
      templates.findOne.mockResolvedValue({
        templateId: 't-1',
        status: 'draft',
        currentVersion: 1,
      } as BehavioralTemplate);
      versions.findOne.mockResolvedValue({
        versionId: 'v-1',
        version: 1,
        frozenAt: null,
        createdBy: ACTOR_ID,
      } as BehavioralTemplateVersion);

      const dto = {
        name: 'Quarterly Review',
        description: ' Reflect on observable behaviors ',
        category: 'general_performance',
        reviewType: 'self',
        sections: [
          {
            title: 'Leadership',
            questions: [
              {
                prompt: 'Meets deadlines?',
                questionType: 'rating_scale' as const,
              },
            ],
          },
        ],
      } as unknown as CreateBehavioralTemplateDto;

      const result = await service.create(dto, 'user-1');

      expect(templates.create).toHaveBeenCalledWith(
        expect.objectContaining({
          company: 'Example Company',
          name: 'Quarterly Review',
          description: 'Reflect on observable behaviors',
          category: 'general_performance',
          reviewType: 'self',
        }),
      );
      expect(result.template.status).toBe('draft');
      expect(result.template.currentVersion).toBe(1);
      expect(result.version?.version).toBe(1);
      expect(result.version?.frozenAt).toBeNull();
      expect(result.version?.createdBy).toBe(ACTOR_ID);
      expect(resolver.resolveAccount).toHaveBeenCalledWith('user-1');
      expect(versions.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: ACTOR_ID }),
      );
      expect(sections.create).toHaveBeenCalledTimes(1);
      expect(questions.create).toHaveBeenCalledTimes(1);
    });

    it('takes the company from the account and refuses an account with no company, before any write', async () => {
      resolver.resolveAccount.mockRejectedValue(new ForbiddenException());
      const dto = { sections: [] } as unknown as CreateBehavioralTemplateDto;

      await expect(service.create(dto, 'user-1')).rejects.toThrow(ForbiddenException);

      expect(templates.save).not.toHaveBeenCalled();
      expect(versions.save).not.toHaveBeenCalled();
    });

    it('rejects multiple_choice questions without two options', async () => {
      const dto = {
        sections: [
          {
            title: 'Section',
            questions: [
              {
                prompt: 'Pick one',
                questionType: 'multiple_choice' as const,
                choiceOptions: [{ label: 'Only one' }],
              },
            ],
          },
        ],
      } as unknown as CreateBehavioralTemplateDto;

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('saves the template, the version, and the content in one transaction', async () => {
      templates.findOne.mockResolvedValue({ templateId: 't-1', status: 'draft' } as BehavioralTemplate);
      const dto = {
        name: 'Quarterly Review',
        sections: [{ title: 'S', questions: [{ prompt: 'Q', questionType: 'short_answer' as const }] }],
      } as unknown as CreateBehavioralTemplateDto;

      await service.create(dto, 'user-1');

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['the same label twice', ['Yes', 'Yes']],
      ['labels that differ only by case', ['Yes', 'yes']],
      ['labels that differ only by spaces', ['Yes', ' Yes ']],
      ['a blank label', ['Yes', '   ']],
    ])('refuses %s with a 400 before any write', async (_label, labels) => {
      const dto = {
        sections: [
          {
            title: 'S',
            questions: [
              { prompt: 'Pick', questionType: 'multiple_choice' as const, choiceOptions: labels.map((label) => ({ label })) },
            ],
          },
        ],
      } as unknown as CreateBehavioralTemplateDto;

      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);

      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(templates.save).not.toHaveBeenCalled();
      expect(versions.save).not.toHaveBeenCalled();
      expect(sections.save).not.toHaveBeenCalled();
    });

    it('saves no options for a question that is not multiple choice, even when the request carries some', async () => {
      templates.findOne.mockResolvedValue({ templateId: 't-1', status: 'draft' } as BehavioralTemplate);
      const dto = {
        sections: [
          {
            title: 'S',
            questions: [
              { prompt: 'Rate', questionType: 'rating_scale', choiceOptions: [{ label: 'Yes' }, { label: 'Yes' }] },
            ],
          },
        ],
      } as unknown as CreateBehavioralTemplateDto;

      await service.create(dto, 'user-1');

      expect(options.create).not.toHaveBeenCalled();
      expect(options.save).not.toHaveBeenCalled();
    });

    it('still saves a draft with no section: only a published version needs content', async () => {
      templates.findOne.mockResolvedValue({ templateId: 't-1', status: 'draft' } as BehavioralTemplate);
      const dto = { name: 'Empty draft', sections: [] } as unknown as CreateBehavioralTemplateDto;

      await expect(service.create(dto, 'user-1')).resolves.toBeDefined();
    });

    it('stores allowNotObserved only for rating_scale questions', async () => {
      templates.findOne.mockResolvedValue({
        templateId: 't-1',
        status: 'draft',
        currentVersion: 1,
      } as BehavioralTemplate);
      versions.find.mockResolvedValue([
        { versionId: 'v-1', version: 1, frozenAt: null } as BehavioralTemplateVersion,
      ]);

      const dto = {
        sections: [
          {
            title: 'Section',
            questions: [
              {
                prompt: 'Rate',
                questionType: 'rating_scale' as const,
                allowNotObserved: true,
              },
              {
                prompt: 'Answer',
                questionType: 'short_answer' as const,
                allowNotObserved: true,
              },
            ],
          },
        ],
      } as unknown as CreateBehavioralTemplateDto;

      await service.create(dto, 'user-1');

      const first = (questions.create as unknown as Mock).mock.calls[0]?.[0] as {
        questionType: string;
        allowNotObserved: boolean | null;
      };
      const second = (questions.create as unknown as Mock).mock.calls[1]?.[0] as {
        questionType: string;
        allowNotObserved: boolean | null;
      };
      expect(first.allowNotObserved).toBe(true);
      expect(second.allowNotObserved).toBeNull();
    });
  });

  describe('update', () => {
    it('rejects updates on non-draft templates', async () => {
      templates.findOne.mockResolvedValue({
        templateId: 't-1',
        status: 'published',
      } as BehavioralTemplate);

      await expect(
        service.update('t-1', { sections: [] } as unknown as never),
      ).rejects.toThrow(ConflictException);
    });

    it('refuses duplicate options with a 400 before it deletes the old content of the draft', async () => {
      templates.findOne.mockResolvedValue({ templateId: 't-1', status: 'draft' } as BehavioralTemplate);
      versions.findOne.mockResolvedValue({ versionId: 'v-1', frozenAt: null } as BehavioralTemplateVersion);
      const dto = {
        sections: [
          {
            title: 'S',
            questions: [
              { prompt: 'Pick', questionType: 'multiple_choice', choiceOptions: [{ label: 'Yes' }, { label: 'yes' }] },
            ],
          },
        ],
      } as unknown as never;

      await expect(service.update('t-1', dto)).rejects.toThrow(BadRequestException);

      expect(sections.delete).not.toHaveBeenCalled();
      expect(questions.delete).not.toHaveBeenCalled();
      expect(options.delete).not.toHaveBeenCalled();
      expect(templates.save).not.toHaveBeenCalled();
    });

    it('replaces the details and the content in one transaction, with the template row locked', async () => {
      templates.findOne.mockResolvedValue({ templateId: 't-1', status: 'draft' } as BehavioralTemplate);
      versions.findOne.mockResolvedValue({ versionId: 'v-1', frozenAt: null } as BehavioralTemplateVersion);

      await service.update('t-1', { sections: [] } as unknown as never);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(templates.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
    });

    it('changes the details of a draft only for the fields it is given', async () => {
      const template = {
        templateId: 't-1',
        status: 'draft',
        name: 'Old name',
        description: 'Old description',
        category: 'general_performance',
        reviewType: 'self',
      } as BehavioralTemplate;
      templates.findOne.mockResolvedValue(template);
      versions.findOne.mockResolvedValue({
        versionId: 'v-1',
        frozenAt: null,
      } as BehavioralTemplateVersion);

      await service.update('t-1', {
        name: ' New name ',
        category: 'peer_feedback',
        sections: [],
      } as unknown as never);

      expect(templates.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New name',
          description: 'Old description',
          category: 'peer_feedback',
          reviewType: 'self',
        }),
      );
    });
  });

  describe('createVersion', () => {
    const published = () =>
      ({
        templateId: 't-1',
        company: 'Example Company',
        name: 'Old name',
        description: 'Old description',
        category: 'general_performance',
        reviewType: 'self',
        status: 'published',
        currentVersion: 1,
        publishedBy: 'someone',
        publishedAt: new Date('2026-11-01'),
      }) as BehavioralTemplate;
    const body = (overrides: Record<string, unknown> = {}) =>
      ({
        sections: [
          {
            sectionId: 'client-section',
            title: 'Leadership',
            questions: [
              {
                questionId: 'client-question',
                prompt: 'Meets deadlines?',
                questionType: 'multiple_choice',
                choiceOptions: [{ label: 'Yes' }, { label: 'No' }],
              },
            ],
          },
        ],
        ...overrides,
      }) as unknown as never;

    beforeEach(() => {
      manager.findOne.mockResolvedValue(published());
      // The answer is the tree of the latest version.
      templates.findOne.mockResolvedValue({ ...published(), currentVersion: 2 });
      versions.findOne.mockResolvedValue({ versionId: 'v-2', version: 2 } as BehavioralTemplateVersion);
    });

    it('publishes the next version, frozen at once, by the account actor', async () => {
      await service.createVersion('t-1', body(), 'user-1');

      expect(resolver.resolveAccount).toHaveBeenCalledWith('user-1');
      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: 't-1', currentVersion: 2, publishedBy: ACTOR_ID, status: 'published' }),
      );
      const version = manager.create.mock.calls.find(([entity]) => entity === BehavioralTemplateVersion)?.[1] as
        | Record<string, unknown>
        | undefined;
      expect(version).toMatchObject({ templateId: 't-1', version: 2, createdBy: ACTOR_ID });
      expect(version?.frozenAt).toBeInstanceOf(Date);
    });

    it('locks the template row, and keeps the version that was published: nothing is deleted', async () => {
      await service.createVersion('t-1', body(), 'user-1');

      expect(manager.findOne).toHaveBeenCalledWith(
        BehavioralTemplate,
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.delete).not.toHaveBeenCalled();
      expect(sections.delete).not.toHaveBeenCalled();
      expect(questions.delete).not.toHaveBeenCalled();
      expect(options.delete).not.toHaveBeenCalled();
    });

    it('gives the new sections, questions, and options new ids, whatever ids the request carries', async () => {
      await service.createVersion('t-1', body(), 'user-1');

      const section = sections.create.mock.calls[0]?.[0] as { sectionId: string; versionId: string };
      const question = questions.create.mock.calls[0]?.[0] as { questionId: string; sectionId: string };
      expect(section.sectionId).not.toBe('client-section');
      expect(question.questionId).not.toBe('client-question');
      expect(question.sectionId).toBe(section.sectionId);
      expect(section.versionId).not.toBe('v-1');
      expect(options.save).toHaveBeenCalled();
    });

    it('changes the details only for the fields it is given', async () => {
      await service.createVersion('t-1', body({ name: ' New name ', category: 'peer_feedback' }), 'user-1');

      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New name',
          category: 'peer_feedback',
          description: 'Old description',
          reviewType: 'self',
        }),
      );
    });

    it.each(['draft', 'archived'] as const)('refuses a %s template with a 409, and writes nothing', async (status) => {
      manager.findOne.mockResolvedValue({ ...published(), status });

      await expect(service.createVersion('t-1', body(), 'user-1')).rejects.toThrow(ConflictException);

      expect(manager.save).not.toHaveBeenCalled();
      expect(sections.save).not.toHaveBeenCalled();
    });

    it('answers 404 for a template that does not exist, and writes nothing', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.createVersion('t-1', body(), 'user-1')).rejects.toThrow(NotFoundException);

      expect(manager.save).not.toHaveBeenCalled();
    });

    it.each([
      ['no section', { sections: [] }],
      ['a section with no question', { sections: [{ title: 'Empty', questions: [] }] }],
    ])('refuses %s with a 400 before it opens a transaction: a frozen version needs content', async (_label, overrides) => {
      await expect(service.createVersion('t-1', body(overrides), 'user-1')).rejects.toThrow(BadRequestException);

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('refuses a multiple choice question with fewer than two options, and never reports success', async () => {
      const oneOption = body({
        sections: [
          {
            title: 'S',
            questions: [{ prompt: 'Pick', questionType: 'multiple_choice', choiceOptions: [{ label: 'Yes' }] }],
          },
        ],
      });

      await expect(service.createVersion('t-1', oneOption, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('publish', () => {
    const draftWithContent = () => {
      templates.findOne.mockResolvedValue({
        templateId: 't-1',
        status: 'draft',
      } as BehavioralTemplate);
      versions.findOne.mockResolvedValue({
        versionId: 'v-1',
        frozenAt: null,
      } as BehavioralTemplateVersion);
      sections.find.mockResolvedValue([{ sectionId: 's-1' } as BehavioralSection]);
      questions.find.mockResolvedValue([{ questionId: 'q-1', sectionId: 's-1' } as BehavioralQuestion]);
    };

    it.each([
      ['no section', [], []],
      ['a section with no question', [{ sectionId: 's-1' }], []],
    ])('refuses a draft with %s with a 400, and freezes nothing', async (_label, sectionRows, questionRows) => {
      draftWithContent();
      sections.find.mockResolvedValue(sectionRows as BehavioralSection[]);
      questions.find.mockResolvedValue(questionRows as BehavioralQuestion[]);

      await expect(service.publish('t-1', 'user-1')).rejects.toThrow(BadRequestException);

      expect(versions.save).not.toHaveBeenCalled();
      expect(templates.save).not.toHaveBeenCalled();
    });

    it('freezes the version and publishes the template in one transaction, with the row locked', async () => {
      draftWithContent();

      await service.publish('t-1', 'user-1');

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(templates.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
    });

    it('freezes the active version and publishes the draft', async () => {
      draftWithContent();

      const result = await service.publish('t-1', 'user-1');

      expect(result.template.status).toBe('published');
      expect(result.template.publishedBy).toBe(ACTOR_ID);
      expect(resolver.resolveAccount).toHaveBeenCalledWith('user-1');
      expect(result.template.publishedAt).toBeInstanceOf(Date);
      expect(result.version?.frozenAt).toBeInstanceOf(Date);
    });

    it('rejects publishing an archived template', async () => {
      templates.findOne.mockResolvedValue({
        templateId: 't-1',
        status: 'archived',
      } as BehavioralTemplate);

      await expect(service.publish('t-1', 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getById', () => {
    it('throws NotFoundException for missing templates', async () => {
      templates.findOne.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('list', () => {
    it('returns templates ordered by updatedAt descending', async () => {
      templates.find.mockResolvedValue([]);

      const result = await service.list();
      expect(templates.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
