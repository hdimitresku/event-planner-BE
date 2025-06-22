import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BullModule} from '@nestjs/bull';
import {ScheduleModule} from '@nestjs/schedule';
import {AuthModule} from './auth/auth.module';
import {UserModule} from './user/user.module';
import {VenueModule} from './venue/venue.module';
import {BookingModule} from './booking/booking.module';
import {ReviewModule} from './review/review.module';
import {ServiceModule} from './service/service.module';
import {PaymentModule} from './payment/payment.module';
import {NotificationModule} from './notification/notification.module';
import {ExternalReviewModule} from './external-review/external-review.module';
import {AnalyticsModule} from './analytics/analytics.module';
import {MessageModule} from './message/message.module';
import {MediaModule} from './media/media.module';
import {EmailModule} from './email/email.module';
import {AutomapperModule} from "@automapper/nestjs";
import {classes} from '@automapper/classes';


// TODO: Import AuthModule, UserModule, VenueModule, etc. here as we build them

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ScheduleModule.forRoot(),
        AutomapperModule.forRoot({
            strategyInitializer: classes(),
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'postgres'),
                password: configService.get('DB_PASSWORD', 'root'),
                database: configService.get('DB_DATABASE', 'event_planner'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: configService.get('NODE_ENV') !== 'production',
            }),
            inject: [ConfigService],
        }),

        // Queue
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                },
            }),
            inject: [ConfigService],
        }),

        AuthModule,
        UserModule,
        VenueModule,
        BookingModule,
        ReviewModule,
        ServiceModule,
        PaymentModule,
        NotificationModule,
        ExternalReviewModule,
        AnalyticsModule,
        MessageModule,
        MediaModule,
        EmailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}