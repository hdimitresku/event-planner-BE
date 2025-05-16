import { Exclude, Expose } from 'class-transformer';
import { UserDto } from '@/user/dto/user.dto';

@Exclude()
export class AuthDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  user: UserDto;

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
} 