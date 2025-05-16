import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket[]> = new Map();

  constructor(private readonly notificationService: NotificationService) {}

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user as User;
      if (!user) {
        client.disconnect();
        return;
      }

      const userSockets = this.userSockets.get(user.id) || [];
      userSockets.push(client);
      this.userSockets.set(user.id, userSockets);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as User;
    if (user) {
      const userSockets = this.userSockets.get(user.id) || [];
      const index = userSockets.indexOf(client);
      if (index > -1) {
        userSockets.splice(index, 1);
        if (userSockets.length === 0) {
          this.userSockets.delete(user.id);
        } else {
          this.userSockets.set(user.id, userSockets);
        }
      }
    }
  }

  async sendNotification(userId: string, notification: Notification) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socket => {
        socket.emit('notification', notification);
      });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, notificationId: string) {
    const user = client.data.user as User;
    const notification = await this.notificationService.markAsRead(notificationId, user);
    return notification;
  }
} 