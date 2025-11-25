import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Service for user operations
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * Get user profile by Firebase UID
   *
   * @param firebaseUid - Firebase UID from verified token
   * @returns User data (snake_case)
   * @throws NotFoundException if user doesn't exist
   */
  async getUserProfile(firebaseUid: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl ?? undefined,
      credits: user.credits,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Register or update user based on Firebase UID
   * - For anonymous users: delegates to getOrCreateAnonymousUser (handles migration + deviceId naming)
   * - For registered users: creates/updates with provided data
   *
   * @param firebaseUid - Firebase UID from verified token
   * @param dto - User registration data (snake_case from client)
   * @param isAnonymous - Whether this is an anonymous user
   * @param deviceId - Device ID for anonymous user tracking
   * @returns User data (snake_case)
   */
  async registerUser(
    firebaseUid: string,
    dto: RegisterUserDto,
    isAnonymous: boolean = false,
    deviceId?: string,
  ): Promise<UserResponseDto> {
    // Handle anonymous users - delegate to getOrCreateAnonymousUser
    // This handles UID migration and deviceId-based naming
    if (isAnonymous) {
      return this.getOrCreateAnonymousUser(firebaseUid, deviceId);
    }

    // Handle registered users
    const user = await this.prisma.user.upsert({
      where: { firebaseUid },
      update: {
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatar_url,
        isAnonymous: false,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        firebaseUid,
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatar_url,
        isAnonymous: false,
        credits: 2,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl ?? undefined,
      credits: user.credits,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Get or create anonymous user
   * - Checks for existing anonymous account by deviceId (migration support)
   * - If exists with different UID: migrates to new Firebase UID (app reinstall case)
   * - If not exists: creates new with deviceId-based naming
   * - Updates lastActiveAt for existing users
   *
   * @param firebaseUid - Firebase UID from anonymous auth
   * @param deviceId - Device ID for tracking
   * @returns User data (snake_case)
   */
  async getOrCreateAnonymousUser(
    firebaseUid: string,
    deviceId?: string,
  ): Promise<UserResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user && deviceId) {
      // Check if device already has an anonymous account (migration case)
      const existingDevice = await this.prisma.user.findFirst({
        where: {
          deviceId,
          isAnonymous: true,
        },
      });

      if (existingDevice) {
        // MIGRATION: Update existing user to new Firebase UID (app reinstall)
        this.logger.log(
          `🔄 Migrating anonymous user: ${existingDevice.firebaseUid} → ${firebaseUid} (device: ${deviceId.slice(-4)})`,
        );

        user = await this.prisma.user.update({
          where: { id: existingDevice.id },
          data: {
            firebaseUid, // Update to new UID
            lastActiveAt: new Date(),
          },
        });

        this.logger.log(
          `✅ Migration successful: User ${user.id} now linked to ${firebaseUid}`,
        );
      }
    }

    if (!user) {
      // Generate guest name and email from deviceId last 4 chars
      const deviceSuffix = deviceId
        ? deviceId.slice(-4).toUpperCase()
        : firebaseUid.slice(-4).toUpperCase();

      const guestName = `Guest ${deviceSuffix}`; // e.g., "Guest A1B2"
      const guestEmail = `guest-${deviceSuffix.toLowerCase()}@anonymous.temp`; // e.g., "guest-a1b2@anonymous.temp"

      // Create new anonymous user
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          name: guestName,
          email: guestEmail,
          isAnonymous: true,
          deviceId,
          credits: 1,
        },
      });

      this.logger.log(
        `✨ Created anonymous user: ${guestName} (${firebaseUid}, device: ${deviceSuffix})`,
      );
    } else {
      // Update last active time for existing user
      await this.prisma.user.update({
        where: { firebaseUid },
        data: { lastActiveAt: new Date() },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl ?? undefined,
      credits: user.credits,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Get all users with pagination and filtering
   */
  async findAll(
    page: number,
    limit: number,
    search?: string,
    type?: 'all' | 'anonymous' | 'real',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter by type
    if (type === 'anonymous') {
      where.isAnonymous = true;
    } else if (type === 'real') {
      where.isAnonymous = false;
    }

    // Filter by search term (name or email)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl ?? undefined,
        credits: user.credits,
        is_anonymous: user.isAnonymous,
        last_active_at: user.lastActiveAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
