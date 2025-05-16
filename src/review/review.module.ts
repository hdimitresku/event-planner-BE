import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewProfile } from './review.mapper';
import { VenueModule } from '../venue/venue.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    VenueModule,
    BookingModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewProfile],
  exports: [ReviewService],
})
export class ReviewModule {} 