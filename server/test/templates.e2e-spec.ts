import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EnvelopeInterceptor } from '../src/common/interceptors/envelope.interceptor';
import { HttpEnvelopeExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Templates (e2e) with DevAuth', () => {
  let app: INestApplication;

  const DEV_TOKEN = 'devtoken';

  // Mock Prisma to avoid real DB dependency in e2e
  const prismaMock: Partial<PrismaService> = {
    template: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'anime-style',
          name: 'Phong cách Anime',
          thumbnailUrl: 'https://example.com/templates/anime-thumb.jpg',
          publishedAt: new Date('2025-10-20T07:30:00Z'),
          usageCount: 120,
        },
        {
          id: 'cartoon',
          name: 'Cartoon Style',
          thumbnailUrl: 'https://example.com/templates/cartoon-thumb.jpg',
          publishedAt: new Date('2025-10-19T10:00:00Z'),
          usageCount: 50,
        },
      ]),
    } as any,
  };

  // Helper to reset mock data
  const resetMockTemplates = (templates: any[]) => {
    (prismaMock.template!.findMany as jest.Mock).mockResolvedValue(templates);
  };

  beforeAll(async () => {
    // Enable DevAuth
    process.env.DEV_AUTH_ENABLED = 'true';
    process.env.DEV_AUTH_TOKEN = DEV_TOKEN;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();

    // Replicate global pipes/interceptors/filters as in main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidUnknownValues: false }));
    app.useGlobalInterceptors(new EnvelopeInterceptor());
    app.useGlobalFilters(new HttpEnvelopeExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/templates should return 401 when Authorization header is missing', async () => {
    const res = await request(app.getHttpServer()).get('/v1/templates').expect(401);

    // Envelope error assertion
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('GET /v1/templates should return 401 when token is invalid', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/templates')
      .set('Authorization', 'Bearer wrong-token')
      .expect(401);

    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('GET /v1/templates should return 200 and envelope with templates when Dev token is valid', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/templates')
      .set('Authorization', `Bearer ${DEV_TOKEN}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.templates)).toBe(true);
    // Spot check mapping fields
    const tpl = res.body.data.templates[0];
    expect(tpl).toHaveProperty('id');
    expect(tpl).toHaveProperty('name');
    expect(tpl).toHaveProperty('thumbnail_url');
    expect(tpl).toHaveProperty('published_at');
    expect(tpl).toHaveProperty('usage_count');
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      // Reset to default mock data
      resetMockTemplates([
        {
          id: 'anime-style',
          name: 'Phong cách Anime',
          thumbnailUrl: 'https://example.com/templates/anime-thumb.jpg',
          publishedAt: new Date('2025-10-20T07:30:00Z'),
          usageCount: 120,
        },
        {
          id: 'cartoon',
          name: 'Cartoon Style',
          thumbnailUrl: 'https://example.com/templates/cartoon-thumb.jpg',
          publishedAt: new Date('2025-10-19T10:00:00Z'),
          usageCount: 50,
        },
      ]);
    });

    it('GET /v1/templates?limit=10 should respect limit parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?limit=10')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toBeDefined();
    });

    it('GET /v1/templates?offset=5 should respect offset parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?offset=5')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('GET /v1/templates?q=anime should search by query', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?q=anime')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toBeDefined();
    });

    it('GET /v1/templates?tags=anime,portrait should filter by tags', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?tags=anime,portrait')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toBeDefined();
    });

    it('GET /v1/templates?sort=popular should sort by usage count', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?sort=popular')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toBeDefined();
    });

    it('GET /v1/templates?sort=newest should sort by published date', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?sort=newest')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('GET /v1/templates?sort=name should sort by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?sort=name')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should combine multiple query parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates?limit=10&offset=0&q=anime&sort=popular')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return templates with correct field names (snake_case)', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/templates')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      const template = res.body.data.templates[0];
      
      // API should use snake_case
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('thumbnail_url');
      expect(template).toHaveProperty('published_at');
      expect(template).toHaveProperty('usage_count');

      // Should NOT have camelCase fields
      expect(template).not.toHaveProperty('thumbnailUrl');
      expect(template).not.toHaveProperty('publishedAt');
      expect(template).not.toHaveProperty('usageCount');
    });

    it('should omit null fields from response', async () => {
      resetMockTemplates([
        {
          id: 'test',
          name: 'Test Template',
          thumbnailUrl: null,
          publishedAt: null,
          usageCount: 0,
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/v1/templates')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      const template = res.body.data.templates[0];
      
      expect(template.id).toBe('test');
      expect(template.name).toBe('Test Template');
      expect(template.usage_count).toBe(0);
      // null fields should be omitted (not present in response)
      expect(template.thumbnail_url).toBeUndefined();
      expect(template.published_at).toBeUndefined();
    });

    it('should return empty array when no templates found', async () => {
      resetMockTemplates([]);

      const res = await request(app.getHttpServer())
        .get('/v1/templates')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templates).toEqual([]);
    });
  });
});
