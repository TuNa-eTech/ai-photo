/**
 * User response DTO matching iOS UserRegisterResponse
 */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

