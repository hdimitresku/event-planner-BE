import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../user/entities/user.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  private async findNotificationEntity(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async create(createNotificationDto: CreateNotificationDto, user: User): Promise<NotificationDto> {
    const notification = this.mapper.map(createNotificationDto, CreateNotificationDto, Notification);
    notification.user = { id: user.id } as User;
    notification.message = createNotificationDto.content;
    notification.priority = (createNotificationDto.priority ?? NotificationPriority.MEDIUM) as NotificationPriority;

    const savedNotification = await this.notificationRepository.save(notification);
    return this.mapper.map(savedNotification, Notification, NotificationDto);
  }

  async findAll(user: User): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return notifications.map(notification => this.mapper.map(notification, Notification, NotificationDto));
  }

  async findUnread(user: User): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: user.id }, isRead: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return notifications.map(notification => this.mapper.map(notification, Notification, NotificationDto));
  }

  async findOne(id: string, user: User): Promise<NotificationDto> {
    const notification = await this.findNotificationEntity(id, user.id);
    return this.mapper.map(notification, Notification, NotificationDto);
  }

  async markAsRead(id: string, user: User): Promise<NotificationDto> {
    const notification = await this.findNotificationEntity(id, user.id);
    notification.isRead = true;
    const updatedNotification = await this.notificationRepository.save(notification);
    return this.mapper.map(updatedNotification, Notification, NotificationDto);
  }

  async markAllAsRead(user: User): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: user.id }, isRead: false },
      { isRead: true },
    );
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, user: User): Promise<NotificationDto> {
    const notification = await this.findNotificationEntity(id, user.id);
    const updatedNotification = this.mapper.map(updateNotificationDto, UpdateNotificationDto, Notification);
    Object.assign(notification, updatedNotification);
    const savedNotification = await this.notificationRepository.save(notification);
    return this.mapper.map(savedNotification, Notification, NotificationDto);
  }

  async remove(id: string, user: User): Promise<void> {
    const notification = await this.findNotificationEntity(id, user.id);
    await this.notificationRepository.remove(notification);
  }

  async removeAll(user: User): Promise<void> {
    await this.notificationRepository.delete({ user: { id: user.id } });
  }

  async createNotification(data: CreateNotificationDto & { userId: string }): Promise<NotificationDto> {
    const notification = this.mapper.map(data, CreateNotificationDto, Notification);
    notification.user = { id: data.userId } as User;
    notification.message = data.content;
    notification.priority = (data.priority ?? NotificationPriority.MEDIUM) as NotificationPriority;

    const savedNotification = await this.notificationRepository.save(notification);
    return this.mapper.map(savedNotification, Notification, NotificationDto);
  }

  async getUserNotifications(user: User): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return notifications.map(notification => this.mapper.map(notification, Notification, NotificationDto));
  }

  async getUnreadCount(user: User): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: user.id }, isRead: false },
    });
  }

  async removeNotification(id: string, user: User): Promise<void> {
    const result = await this.notificationRepository.delete({ id, user: { id: user.id } });
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }
} 