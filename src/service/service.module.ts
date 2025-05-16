import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Service} from './entities/service.entity';
import {ServiceOption} from './entities/service-option.entity';
import {ServiceService} from './service.service';
import {ServiceController} from './service.controller';
import {ServiceProfile} from './service.mapper';
import {MediaModule} from '@/media/media.module';
import {Booking} from "@/booking/booking.entity";
import {AutomapperModule} from "@automapper/nestjs";

@Module({
    imports: [
        TypeOrmModule.forFeature([Service, ServiceOption, Booking]),
        MediaModule,
        AutomapperModule
    ],
    controllers: [ServiceController],
    providers: [ServiceService, ServiceProfile],
    exports: [ServiceService],
})
export class ServiceModule {
}