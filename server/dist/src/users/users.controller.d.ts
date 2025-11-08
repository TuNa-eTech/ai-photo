import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: Request & {
        firebaseUid?: string;
    }): Promise<UserResponseDto>;
    register(req: Request & {
        firebaseUid?: string;
    }, dto: RegisterUserDto): Promise<UserResponseDto>;
}
