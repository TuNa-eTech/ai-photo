import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserProfile(firebaseUid: string): Promise<UserResponseDto>;
    registerUser(firebaseUid: string, dto: RegisterUserDto): Promise<UserResponseDto>;
}
