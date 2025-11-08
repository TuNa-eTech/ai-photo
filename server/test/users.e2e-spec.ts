import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EnvelopeInterceptor } from '../src/common/interceptors/envelope.interceptor';
import { HttpEnvelopeExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Users (e2e) with DevAuth', () => {
  let app: INestApplication;

  const DEV_TOKEN = 'devtoken';
  const DEV_FIREBASE_UID = 'dev-user-uid-123';

  const mockUser = {
    id: 'user-id-123',
    firebaseUid: DEV_FIREBASE_UID,
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date('2025-10-26T10:00:00Z'),
    updatedAt: new Date('2025-10-26T10:00:00Z'),
  };

  // Mock Prisma to avoid real DB dependency in e2e
  const prismaMock: Partial<PrismaService> = {
    user: {
      upsert: jest.fn().mockResolvedValue(mockUser),
      findUnique: jest.fn().mockResolvedValue(mockUser),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/users/register', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        })
        .expect(401);

      // Envelope error assertion
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', 'Bearer wrong-token')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('should register new user with valid token', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(201);

      // Envelope success assertion
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();

      // Data assertions
      const user = res.body.data;
      expect(user.id).toBe(mockUser.id);
      expect(user.name).toBe(mockUser.name);
      expect(user.email).toBe(mockUser.email);
      expect(user.avatar_url).toBe(mockUser.avatarUrl);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();

      // Verify Prisma was called correctly
      expect(prismaMock.user!.upsert).toHaveBeenCalledWith({
        where: { firebaseUid: DEV_FIREBASE_UID },
        update: expect.objectContaining({
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.avatar_url,
        }),
        create: expect.objectContaining({
          firebaseUid: DEV_FIREBASE_UID,
          name: payload.name,
          email: payload.email,
          avatarUrl: payload.avatar_url,
        }),
      });
    });

    it('should register user without avatarURL', async () => {
      const payload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const userWithoutAvatar = {
        ...mockUser,
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatarUrl: null,
      };

      (prismaMock.user!.upsert as jest.Mock).mockResolvedValueOnce(userWithoutAvatar);

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.email).toBe(payload.email);
      expect(res.body.data.avatar_url).toBeUndefined();
    });

    it('should return 400 when name is missing', async () => {
      const payload = {
        email: 'john@example.com',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when email is missing', async () => {
      const payload = {
        name: 'John Doe',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
      const payload = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when avatar_url is invalid URL', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'not-a-valid-url',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should update existing user on subsequent registration', async () => {
      const initialPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'https://example.com/avatar1.jpg',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(initialPayload)
        .expect(201);

      // Update with new data
      const updatedPayload = {
        name: 'John Smith',
        email: 'johnsmith@example.com',
        avatar_url: 'https://example.com/avatar2.jpg',
      };

      const updatedUser = {
        ...mockUser,
        name: 'John Smith',
        email: 'johnsmith@example.com',
        avatarUrl: 'https://example.com/avatar2.jpg',
        updatedAt: new Date('2025-10-26T11:00:00Z'),
      };

      (prismaMock.user!.upsert as jest.Mock).mockResolvedValueOnce(updatedUser);

      const res = await request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .send(updatedPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updatedPayload.name);
      expect(res.body.data.email).toBe(updatedPayload.email);
      expect(res.body.data.avatar_url).toBe(updatedPayload.avatar_url);

      // Verify upsert was called twice
      expect(prismaMock.user!.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET /v1/users/me', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .expect(401);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer wrong-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      // Envelope success assertion
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();

      // Data assertions
      const user = res.body.data;
      expect(user.id).toBe(mockUser.id);
      expect(user.name).toBe(mockUser.name);
      expect(user.email).toBe(mockUser.email);
      expect(user.avatar_url).toBe(mockUser.avatarUrl);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();

      // Verify Prisma was called correctly
      expect(prismaMock.user!.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: DEV_FIREBASE_UID },
      });
    });

    it('should return 404 when user does not exist', async () => {
      (prismaMock.user!.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('user_not_found');
    });

    it('should return user profile without avatar URL', async () => {
      const userWithoutAvatar = {
        ...mockUser,
        avatarUrl: null,
      };

      (prismaMock.user!.findUnique as jest.Mock).mockResolvedValueOnce(userWithoutAvatar);

      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${DEV_TOKEN}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(userWithoutAvatar.name);
      expect(res.body.data.email).toBe(userWithoutAvatar.email);
      expect(res.body.data.avatar_url).toBeUndefined();
    });
  });
});

