import { IsEnum, IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class UpdateNotificationDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 