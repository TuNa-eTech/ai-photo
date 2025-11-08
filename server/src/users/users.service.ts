import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Service for user operations
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Register or update user based on Firebase UID
   * - If user with firebaseUid exists: update name, email, avatarUrl
   * - If user doesn't exist: create new user
   * 
   * @param firebaseUid - Firebase UID from verified token
   * @param dto - User registration data (snake_case from client)
   * @returns User data (snake_case)
   */
  async registerUser(firebaseUid: string, dto: RegisterUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.upsert({
      where: { firebaseUid },
      update: {
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatar_url,
        updatedAt: new Date(),
      },
      create: {
        firebaseUid,
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatar_url,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl ?? undefined,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}

