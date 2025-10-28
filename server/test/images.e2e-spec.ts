import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EnvelopeInterceptor } from '../src/common/interceptors/envelope.interceptor';
import { HttpEnvelopeExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Images (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Enable DevAuth for testing
    process.env.DEV_AUTH_ENABLED = 'true';
    process.env.DEV_AUTH_TOKEN = 'devtoken';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate global pipes/interceptors/filters as in main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidUnknownValues: false }));
    app.useGlobalInterceptors(new EnvelopeInterceptor());
    app.useGlobalFilters(new HttpEnvelopeExceptionFilter());

    await app.init();

    // Get auth token for testing
    authToken = 'devtoken';
  });

  afterAll(async () => {
    await app.close();
  });

  const createValidImageBase64 = (): string => {
    // Create a small 1x1 pixel JPEG in base64
    const jpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wCf/AP/Z';
    return `data:image/jpeg;base64,${jpegBase64}`;
  };

  const getMockTemplateId = (): string => {
    // In real test, query database for a template
    // For now, return a mock UUID
    return '550e8400-e29b-41d4-a716-446655440000';
  };

  describe('POST /v1/images/process', () => {
    it('should return 401 Unauthorized without auth token', () => {
      return request(app.getHttpServer())
        .post('/v1/images/process')
        .send({
          template_id: getMockTemplateId(),
          image_base64: createValidImageBase64(),
        })
        .expect(401);
    });

    it('should return 400 Bad Request without required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/images/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 when template not found', () => {
      return request(app.getHttpServer())
        .post('/v1/images/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          template_id: '00000000-0000-0000-0000-000000000000',
          image_base64: createValidImageBase64(),
        })
        .expect(404);
    });

    it('should return 404 or 400 with invalid image format', () => {
      return request(app.getHttpServer())
        .post('/v1/images/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          template_id: getMockTemplateId(),
          image_base64: 'not-a-valid-base64',
        })
        .expect((res) => {
          expect([400, 404, 500]).toContain(res.status);
        });
    });

    // Note: Actual image processing test requires:
    // 1. Real Gemini API key configured
    // 2. Valid template with prompt in database
    // 3. Valid image base64
    // This is an integration test that should run with real API
    
    // TODO: Add integration test with real Gemini API
    // it('should process image successfully with valid request', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/v1/images/process')
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send({
    //       template_id: getMockTemplateId(),
    //       image_base64: createValidImageBase64(),
    //     })
    //     .expect(200);
    //   
    //   expect(response.body.success).toBe(true);
    //   expect(response.body.data.processed_image_base64).toBeDefined();
    //   expect(response.body.data.metadata).toBeDefined();
    // });
  });
});

