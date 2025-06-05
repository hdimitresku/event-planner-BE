import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailModule } from '../email/email.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Notification} from './entities/notification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), EmailModule],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {} 