import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import {AutoMap} from "@automapper/classes";

@Exclude()
export class UserDto {
  @Expose()
  @AutoMap()
  id: string;

  @Expose()
  @AutoMap()
  email: string;

  @Expose()
  @AutoMap()
  firstName: string;

  @Expose()
  @AutoMap()
  lastName: string;

  @Expose()
  @AutoMap()
  phoneNumber: string;

  @Expose()
  @AutoMap()
  role: UserRole;

  @Expose()
  @AutoMap()
  createdAt: Date;

  @Expose()
  @AutoMap()
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
} 