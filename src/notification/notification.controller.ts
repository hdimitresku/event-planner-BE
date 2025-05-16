import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationDto,
    @Request() req,
  ) {
    return this.notificationService.create(createNotificationDto, req.user);
  }

  @Get()
  async getUserNotifications(@GetUser() user: User) {
    return this.notificationService.getUserNotifications(user);
  }

  @Get('unread/count')
  async getUnreadCount(@GetUser() user: User) {
    return this.notificationService.getUnreadCount(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateNotificationDto: UpdateNotificationDto,
    @Request() req,
  ) {
    return this.notificationService.update(id, updateNotificationDto, req.user);
  }

  @Post(':id/mark-read')
  async markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationService.markAsRead(id, user);
  }

  @Post('mark-all-read')
  async markAllAsRead(@GetUser() user: User) {
    return this.notificationService.markAllAsRead(user);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationService.removeNotification(id, user);
  }

  @Delete()
  removeAll(@Request() req) {
    return this.notificationService.removeAll(req.user);
  }
} 