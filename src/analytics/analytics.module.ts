import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from '../venue/entities/venue.entity';
import { ExternalReview } from '../external-review/entities/external-review.entity';
import { Booking } from '@/booking/booking.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog } from './analytics-log.entity';
import { AnalyticsProfile } from './analytics.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Venue, ExternalReview, AnalyticsLog]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsProfile],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 