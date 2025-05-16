import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { UserDto } from '../dto/user.dto';

export function transformUser(user: User): UserDto {
  return plainToInstance(UserDto, user, {
    excludeExtraneousValues: true,
  });
}

export function transformUsers(users: User[]): UserDto[] {
  return users.map(user => transformUser(user));
} 