import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  // Mock Prisma
  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    const firebaseUid = 'firebase-uid-123';
    const dto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const mockUser = {
      id: 'user-id-123',
      firebaseUid: 'firebase-uid-123',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date('2025-10-26T10:00:00Z'),
      updatedAt: new Date('2025-10-26T10:00:00Z'),
    };

    it('should create a new user when user does not exist', async () => {
      mockPrismaService.user.upsert.mockResolvedValue(mockUser);

      const result = await service.registerUser(firebaseUid, dto);

      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { firebaseUid },
        update: {
          name: dto.name,
          email: dto.email,
          avatarUrl: dto.avatar_url,
          updatedAt: expect.any(Date),
        },
        create: {
          firebaseUid,
          name: dto.name,
          email: dto.email,
          avatarUrl: dto.avatar_url,
        },
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar_url: mockUser.avatarUrl,
        created_at: mockUser.createdAt,
        updated_at: mockUser.updatedAt,
      });
    });

    it('should update existing user when user already exists', async () => {
      const existingUser = {
        ...mockUser,
        name: 'Old Name',
        email: 'old@example.com',
        avatarUrl: null,
      };

      const updatedUser = {
        ...existingUser,
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatar_url,
        updatedAt: new Date('2025-10-26T11:00:00Z'),
      };

      mockPrismaService.user.upsert.mockResolvedValue(updatedUser);

      const result = await service.registerUser(firebaseUid, dto);

      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { firebaseUid },
        update: {
          name: dto.name,
          email: dto.email,
          avatarUrl: dto.avatar_url,
          updatedAt: expect.any(Date),
        },
        create: {
          firebaseUid,
          name: dto.name,
          email: dto.email,
          avatarUrl: dto.avatar_url,
        },
      });

      expect(result.name).toBe(dto.name);
      expect(result.email).toBe(dto.email);
      expect(result.avatar_url).toBe(dto.avatar_url);
    });

    it('should handle user without avatar URL', async () => {
      const dtoWithoutAvatar: RegisterUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const userWithoutAvatar = {
        ...mockUser,
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatarUrl: null,
      };

      mockPrismaService.user.upsert.mockResolvedValue(userWithoutAvatar);

      const result = await service.registerUser(firebaseUid, dtoWithoutAvatar);

      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { firebaseUid },
        update: {
          name: dtoWithoutAvatar.name,
          email: dtoWithoutAvatar.email,
          avatarUrl: undefined,
          updatedAt: expect.any(Date),
        },
        create: {
          firebaseUid,
          name: dtoWithoutAvatar.name,
          email: dtoWithoutAvatar.email,
          avatarUrl: undefined,
        },
      });

      expect(result.avatar_url).toBeUndefined();
    });

    it('should use correct Firebase UID for upsert', async () => {
      const differentFirebaseUid = 'different-firebase-uid';
      mockPrismaService.user.upsert.mockResolvedValue({
        ...mockUser,
        firebaseUid: differentFirebaseUid,
      });

      await service.registerUser(differentFirebaseUid, dto);

      expect(prismaService.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { firebaseUid: differentFirebaseUid },
          create: expect.objectContaining({
            firebaseUid: differentFirebaseUid,
          }),
        }),
      );
    });

    it('should return snake_case fields in response', async () => {
      mockPrismaService.user.upsert.mockResolvedValue(mockUser);

      const result = await service.registerUser(firebaseUid, dto);

      // Check that response uses snake_case
      expect(result).toHaveProperty('avatar_url');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');

      // Check that response does not have camelCase
      expect(result).not.toHaveProperty('avatarUrl');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('getUserProfile', () => {
    const firebaseUid = 'firebase-uid-123';

    const mockUser = {
      id: 'user-id-123',
      firebaseUid: 'firebase-uid-123',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date('2025-10-26T10:00:00Z'),
      updatedAt: new Date('2025-10-26T10:00:00Z'),
    };

    it('should return user profile when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile(firebaseUid);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar_url: mockUser.avatarUrl,
        created_at: mockUser.createdAt,
        updated_at: mockUser.updatedAt,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserProfile(firebaseUid)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid },
      });
    });

    it('should return snake_case fields in response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserProfile(firebaseUid);

      // Check that response uses snake_case
      expect(result).toHaveProperty('avatar_url');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');

      // Check that response does not have camelCase
      expect(result).not.toHaveProperty('avatarUrl');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('should handle user without avatar URL', async () => {
      const userWithoutAvatar = {
        ...mockUser,
        avatarUrl: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutAvatar);

      const result = await service.getUserProfile(firebaseUid);

      expect(result.avatar_url).toBeUndefined();
    });
  });
});
