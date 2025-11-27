import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
import { GetUsersDto } from './dto/get-users.dto';
import { Query } from '@nestjs/common';

/**
 * Users controller
 * Handles user registration and profile operations
 */
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * GET /v1/users/me
   * Get current user profile
   * Requires Firebase authentication via Bearer token
   */
  @Get('me')
  @UseGuards(BearerAuthGuard)
  async getProfile(
    @Req() req: Request & { firebaseUid?: string },
  ): Promise<UserResponseDto> {
    // firebaseUid is attached by BearerAuthGuard after verifying the token
    const firebaseUid = req.firebaseUid!;
    return this.usersService.getUserProfile(firebaseUid);
  }

  /**
   * POST /v1/users/register
   * Register or update user profile
   * Requires Firebase authentication via Bearer token
   */
  @Post('register')
  @UseGuards(BearerAuthGuard)
  async register(
    @Req() req: Request & { firebaseUid?: string; isAnonymous?: boolean },
    @Body() dto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    // firebaseUid and isAnonymous are attached by BearerAuthGuard
    const firebaseUid = req.firebaseUid!;
    const isAnonymous = req.isAnonymous || false;
    const deviceId = req.headers['x-device-id'] as string | undefined;

    return this.usersService.registerUser(firebaseUid, dto, isAnonymous, deviceId);
  }

  /**
   * GET /v1/users
   * Get all users with pagination and filtering
   * Requires Admin privileges
   */
  @Get()
  @UseGuards(BearerAuthGuard, AdminGuard)
  async findAll(@Query() query: GetUsersDto) {
    return this.usersService.findAll(
      query.page || 1,
      query.limit || 10,
      query.search,
      query.type,
    );
  }
}
