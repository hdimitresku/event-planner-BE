import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ExternalReviewService } from './external-review.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('external-reviews')
@Controller('external-reviews')
@UseGuards(JwtAuthGuard)
export class ExternalReviewController {
  constructor(private readonly externalReviewService: ExternalReviewService) {}

  @Post('sync/:venueId/:placeId')
  @ApiOperation({ summary: 'Sync Google Places reviews for a venue' })
  @ApiResponse({ status: 200, description: 'Reviews synced successfully' })
  async syncGooglePlacesReviews(
    @Param('venueId') venueId: string,
    @Param('placeId') placeId: string,
  ): Promise<void> {
    return this.externalReviewService.syncGooglePlacesReviews(venueId, placeId);
  }

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get all external reviews for a venue' })
  @ApiResponse({ status: 200, description: 'Returns all reviews for the venue' })
  async getVenueReviews(@Param('venueId') venueId: string) {
    return this.externalReviewService.getVenueReviews(venueId);
  }

  @Get('venue/:venueId/rating')
  @ApiOperation({ summary: 'Get aggregated rating for a venue' })
  @ApiResponse({ status: 200, description: 'Returns the average rating and total reviews' })
  async getAggregatedRating(@Param('venueId') venueId: string) {
    return this.externalReviewService.getAggregatedRating(venueId);
  }
} 