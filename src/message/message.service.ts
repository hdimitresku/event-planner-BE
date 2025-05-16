import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@/notification/entities/notification.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { MessageDto } from './dto/message.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly notificationService: NotificationService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createMessage(data: CreateMessageDto & { senderId: string }): Promise<MessageDto> {
    const message = this.messageRepository.create({
      ...data,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send notification to receiver
    await this.notificationService.createNotification({
      userId: data.receiverId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New Message',
      content: `You have received a new message`,
      metadata: {
        messageId: savedMessage.id,
        senderId: data.senderId,
      },
    });

    return this.mapper.map(savedMessage, Message, MessageDto);
  }

  async getConversation(userId1: string, userId2: string): Promise<MessageDto[]> {
    const messages = await this.messageRepository.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      order: { createdAt: 'ASC' },
    });

    return this.mapper.mapArray(messages, Message, MessageDto);
  }

  async markMessageAsRead(messageId: string): Promise<MessageDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    message.isRead = true;
    const updatedMessage = await this.messageRepository.save(message);
    return this.mapper.map(updatedMessage, Message, MessageDto);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
} 