import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { AuthModule } from '../auth/auth.module';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, WsJwtAuthGuard],
  exports: [NotificationService],
})
export class NotificationModule {} 