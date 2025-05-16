import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookingService} from './booking.service';
import {BookingController} from './booking.controller';
import {Booking} from './booking.entity';
import {VenueModule} from '../venue/venue.module';
import {ServiceOption} from '../service/entities/service-option.entity';
import {ServiceModule} from "@/service/service.module";
import {BookingProfile} from './booking.mapper';
import {UserModule} from '@/user/user.module';
import {PaymentModule} from '@/payment/payment.module';
import {NotificationModule} from '@/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, ServiceOption]),
        VenueModule,
        ServiceModule,
        UserModule,
        NotificationModule,
    ],
    controllers: [BookingController],
    providers: [BookingService, BookingProfile],
    exports: [BookingService],
})
export class BookingModule {
}