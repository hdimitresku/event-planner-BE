import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Message} from './message.entity';
import {MessageService} from './message.service';
import {MessageController} from './message.controller';
import {MessageGateway} from './message.gateway';
import {MessageProfile} from './message.mapper';
import {NotificationModule} from "@/notification/notification.module";
import {JwtService} from "@nestjs/jwt";

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        NotificationModule
    ],
    providers: [MessageService, MessageGateway, MessageProfile, JwtService],
    controllers: [MessageController],
    exports: [MessageService],
})
export class MessageModule {
}