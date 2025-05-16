import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation between two users' })
  @ApiResponse({ status: 200, description: 'Returns the conversation messages' })
  async getConversation(
    @GetUser() user: User,
    @Param('userId') otherUserId: string,
  ) {
    return this.messageService.getConversation(user.id, otherUserId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get count of unread messages' })
  @ApiResponse({ status: 200, description: 'Returns the count of unread messages' })
  async getUnreadCount(@GetUser() user: User) {
    return this.messageService.getUnreadCount(user.id);
  }

  @Post(':messageId/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(
    @GetUser() user: User,
    @Param('messageId') messageId: string,
  ) {
    return this.messageService.markMessageAsRead(messageId);
  }
} 