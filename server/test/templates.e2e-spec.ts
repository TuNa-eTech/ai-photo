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
          thumbnailUrl: null,
          publishedAt: null,
          usageCount: 5,
        },
      ]),
    } as any,
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
});
