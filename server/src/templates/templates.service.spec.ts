import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateStatus } from '@prisma/client';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prismaService: PrismaService;

  // Mock Prisma
  const mockPrismaService = {
    template: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listTemplates', () => {
    const mockTemplates = [
      {
        id: 'anime-style',
        name: 'Phong cách Anime',
        thumbnailUrl: 'https://example.com/anime.jpg',
        publishedAt: new Date('2025-10-20T07:30:00Z'),
        usageCount: 120,
      },
      {
        id: 'cartoon',
        name: 'Cartoon Style',
        thumbnailUrl: 'https://example.com/cartoon.jpg',
        publishedAt: new Date('2025-10-19T10:00:00Z'),
        usageCount: 50,
      },
    ];

    beforeEach(() => {
      mockPrismaService.template.findMany.mockResolvedValue(mockTemplates);
    });

    describe('Security Filter', () => {
      it('should only return published + public templates', async () => {
        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: TemplateStatus.published,
              visibility: 'public',
            }),
          }),
        );
      });

      it('should filter by status=published even with search query', async () => {
        const query = {
          limit: 20,
          offset: 0,
          q: 'anime',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: TemplateStatus.published,
              visibility: 'public',
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: expect.any(Array),
                }),
              ]),
            }),
          }),
        );
      });

      it('should filter by status=published even with tags', async () => {
        const query = {
          limit: 20,
          offset: 0,
          tags: 'anime,portrait',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: TemplateStatus.published,
              visibility: 'public',
              AND: expect.arrayContaining([
                expect.objectContaining({
                  tags: { hasSome: ['anime', 'portrait'] },
                }),
              ]),
            }),
          }),
        );
      });
    });

    describe('Search Filter', () => {
      it('should search by name and id when q is provided', async () => {
        const query = {
          limit: 20,
          offset: 0,
          q: 'anime',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: [
                    { name: { contains: 'anime', mode: 'insensitive' } },
                    { id: { contains: 'anime', mode: 'insensitive' } },
                  ],
                }),
              ]),
            }),
          }),
        );
      });

      it('should trim whitespace from search query', async () => {
        const query = {
          limit: 20,
          offset: 0,
          q: '  anime  ',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: [
                    { name: { contains: 'anime', mode: 'insensitive' } },
                    { id: { contains: 'anime', mode: 'insensitive' } },
                  ],
                }),
              ]),
            }),
          }),
        );
      });

      it('should not add search filter when q is empty string', async () => {
        const query = { limit: 20, offset: 0, q: '', sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              status: TemplateStatus.published,
              visibility: 'public',
            },
          }),
        );
      });

      it('should not add search filter when q is whitespace only', async () => {
        const query = {
          limit: 20,
          offset: 0,
          q: '   ',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              status: TemplateStatus.published,
              visibility: 'public',
            },
          }),
        );
      });
    });

    describe('Tags Filter', () => {
      it('should filter by tags when provided', async () => {
        const query = {
          limit: 20,
          offset: 0,
          tags: 'anime,portrait',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  tags: { hasSome: ['anime', 'portrait'] },
                }),
              ]),
            }),
          }),
        );
      });

      it('should trim whitespace from tags', async () => {
        const query = {
          limit: 20,
          offset: 0,
          tags: ' anime , portrait , cyberpunk ',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  tags: { hasSome: ['anime', 'portrait', 'cyberpunk'] },
                }),
              ]),
            }),
          }),
        );
      });

      it('should filter empty tags', async () => {
        const query = {
          limit: 20,
          offset: 0,
          tags: 'anime,,portrait,',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  tags: { hasSome: ['anime', 'portrait'] },
                }),
              ]),
            }),
          }),
        );
      });

      it('should not add tags filter when tags is empty string', async () => {
        const query = {
          limit: 20,
          offset: 0,
          tags: '',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              status: TemplateStatus.published,
              visibility: 'public',
            },
          }),
        );
      });

      it('should combine search and tags filter', async () => {
        const query = {
          limit: 20,
          offset: 0,
          q: 'anime',
          tags: 'portrait',
          sort: 'newest' as const,
        };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: TemplateStatus.published,
              visibility: 'public',
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: expect.any(Array), // Search
                }),
                expect.objectContaining({
                  tags: { hasSome: ['portrait'] }, // Tags
                }),
              ]),
            }),
          }),
        );
      });
    });

    describe('Sorting', () => {
      it('should sort by publishedAt desc when sort=newest', async () => {
        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { publishedAt: 'desc' },
          }),
        );
      });

      it('should sort by usageCount desc when sort=popular', async () => {
        const query = { limit: 20, offset: 0, sort: 'popular' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { usageCount: 'desc' },
          }),
        );
      });

      it('should sort by name asc when sort=name', async () => {
        const query = { limit: 20, offset: 0, sort: 'name' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'asc' },
          }),
        );
      });
    });

    describe('Pagination', () => {
      it('should apply limit and offset', async () => {
        const query = { limit: 10, offset: 20, sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
            skip: 20,
          }),
        );
      });

      it('should use default limit when not provided', async () => {
        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 20,
          }),
        );
      });
    });

    describe('Response Mapping', () => {
      it('should map database fields to API fields', async () => {
        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        const result = await service.listTemplates(query);

        expect(result.templates).toHaveLength(2);
        expect(result.templates[0]).toEqual({
          id: 'anime-style',
          name: 'Phong cách Anime',
          thumbnail_url: 'https://example.com/anime.jpg',
          published_at: '2025-10-20T07:30:00.000Z',
          usage_count: 120,
        });
      });

      it('should omit null fields from response', async () => {
        mockPrismaService.template.findMany.mockResolvedValue([
          {
            id: 'test',
            name: 'Test',
            thumbnailUrl: null,
            publishedAt: null,
            usageCount: 0,
          },
        ]);

        const query = { limit: 20, offset: 0, sort: 'newest' as const };
        const result = await service.listTemplates(query);

        expect(result.templates[0]).toEqual({
          id: 'test',
          name: 'Test',
          // thumbnail_url should be undefined (not null)
          // published_at should be undefined (not null)
          usage_count: 0,
        });
        expect(result.templates[0].thumbnail_url).toBeUndefined();
        expect(result.templates[0].published_at).toBeUndefined();
      });

      it('should select only required fields from database', async () => {
        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        await service.listTemplates(query);

        expect(prismaService.template.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: {
              id: true,
              name: true,
              thumbnailUrl: true,
              publishedAt: true,
              usageCount: true,
            },
          }),
        );
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array when no templates found', async () => {
        mockPrismaService.template.findMany.mockResolvedValue([]);

        const query = { limit: 20, offset: 0, sort: 'newest' as const };
        const result = await service.listTemplates(query);

        expect(result.templates).toEqual([]);
      });

      it('should handle database errors gracefully', async () => {
        mockPrismaService.template.findMany.mockRejectedValue(
          new Error('Database connection failed'),
        );

        const query = { limit: 20, offset: 0, sort: 'newest' as const };

        await expect(service.listTemplates(query)).rejects.toThrow(
          'Database connection failed',
        );
      });
    });
  });
});
