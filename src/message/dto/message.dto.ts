import { Exclude, Expose } from 'class-transformer';
import { User } from '@/user/entities/user.entity';

@Exclude()
export class MessageDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  sender: User;

  @Expose()
  receiver: User;

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<MessageDto>) {
    Object.assign(this, partial);
  }
} 