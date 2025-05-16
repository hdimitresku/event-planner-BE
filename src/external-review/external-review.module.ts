import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalReviewService } from './external-review.service';
import { ExternalReviewController } from './external-review.controller';
import { ExternalReview } from './entities/external-review.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalReview]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [ExternalReviewController],
  providers: [ExternalReviewService],
  exports: [ExternalReviewService],
})
export class ExternalReviewModule {}