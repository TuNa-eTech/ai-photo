import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

/**
 * Users controller
 * Handles user registration and profile operations
 */
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /v1/users/register
   * Register or update user profile
   * Requires Firebase authentication via Bearer token
   */
  @Post('register')
  @UseGuards(BearerAuthGuard)
  async register(
    @Req() req: Request & { firebaseUid?: string },
    @Body() dto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    // firebaseUid is attached by BearerAuthGuard after verifying the token
    const firebaseUid = req.firebaseUid!;
    return this.usersService.registerUser(firebaseUid, dto);
  }
}

