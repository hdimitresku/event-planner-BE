import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalReview } from './entities/external-review.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ExternalReviewDto } from './dto/external-review.dto';

@Injectable()
export class ExternalReviewService {
  private readonly logger = new Logger(ExternalReviewService.name);

  constructor(
    @InjectRepository(ExternalReview)
    private readonly externalReviewRepository: Repository<ExternalReview>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async syncGooglePlacesReviews(venueId: string, placeId: string): Promise<void> {
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;

    try {
      const response = await this.httpService.get(url).toPromise();
      const reviews = response.data.result.reviews;

      for (const review of reviews) {
        const existingReview = await this.externalReviewRepository.findOne({
          where: {
            externalId: review.time.toString(),
            externalSource: 'google_places',
          },
        });

        if (!existingReview) {
          const externalReview = this.externalReviewRepository.create({
            venueId,
            externalId: review.time.toString(),
            externalSource: 'google_places',
            externalUrl: review.author_url,
            rating: review.rating,
            comment: review.text,
            authorName: review.author_name,
            authorPhoto: review.profile_photo_url,
            externalCreatedAt: new Date(review.time * 1000),
          });

          await this.externalReviewRepository.save(externalReview);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to sync Google Places reviews: ${error.message}`);
      throw error;
    }
  }

  async getVenueReviews(venueId: string): Promise<ExternalReviewDto[]> {
    const reviews = await this.externalReviewRepository.find({
      where: { venueId },
      order: { externalCreatedAt: 'DESC' },
    });
    return plainToInstance(ExternalReviewDto, reviews);
  }

  async getAggregatedRating(venueId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const reviews = await this.externalReviewRepository.find({
      where: { venueId },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating,
      totalReviews: reviews.length,
    };
  }
} 