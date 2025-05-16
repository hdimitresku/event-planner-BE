import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket> = new Map();

  constructor(private readonly messageService: MessageService) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.validateConnection(client);
      if (user) {
        this.userSockets.set(user.id, client);
        client.join(`user:${user.id}`);
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket === client) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @GetUser() user: User,
    client: Socket,
    payload: { receiverId: string; content: string },
  ) {
    const message = await this.messageService.createMessage({
      senderId: user.id,
      receiverId: payload.receiverId,
      content: payload.content,
    });

    const receiverSocket = this.userSockets.get(payload.receiverId);
    if (receiverSocket) {
      receiverSocket.emit('newMessage', message);
    }

    return message;
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @GetUser() user: User,
    client: Socket,
    payload: { messageId: string },
  ) {
    const message = await this.messageService.markMessageAsRead(payload.messageId);
    
    const senderSocket = this.userSockets.get(message.sender.id);
    if (senderSocket) {
      senderSocket.emit('messageRead', { messageId: message.id });
    }

    return message;
  }

  private async validateConnection(client: Socket): Promise<User | null> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        return null;
      }

      // Implement token validation logic here
      // Return the user if valid, null if invalid
      return null;
    } catch (error) {
      return null;
    }
  }
} 