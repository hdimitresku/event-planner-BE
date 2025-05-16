import { Exclude, Expose } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';
import { User } from '@/user/entities/user.entity';

@Exclude()
export class NotificationDto {
  @Expose()
  id: string;

  @Expose()
  type: NotificationType;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  isRead: boolean;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  user: User;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<NotificationDto>) {
    Object.assign(this, partial);
  }
} 