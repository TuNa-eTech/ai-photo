import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

/**
 * DTO for user registration request
 * Accepts snake_case from client (iOS uses convertToSnakeCase)
 * Email can be empty for anonymous users (backend auto-generates)
 */
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsString()
  email: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}
