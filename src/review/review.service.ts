import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../user/entities/user.entity';
import { VenueService } from '../venue/venue.service';
import { BookingService } from '../booking/booking.service';
import { BookingStatus } from '../booking/booking.entity';
import { UserDto } from '../user/dto/user.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly venueService: VenueService,
    private readonly bookingService: BookingService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<ReviewDto> {
    const venue = await this.venueService.findOne(createReviewDto.venueId);

    // Check if user has completed a booking for this venue
    const hasCompletedBooking = await this.checkCompletedBooking(user.id, venue.id);
    if (!hasCompletedBooking) {
      throw new BadRequestException('You can only review venues you have booked and completed');
    }

    // Check if user has already reviewed this venue
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: user.id },
        venue: { id: venue.id },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this venue');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user: { id: user.id },
      venue: { id: venue.id },
    });

    const savedReview = await this.reviewRepository.save(review);
    return this.mapper.map(savedReview, Review, ReviewDto);
  }

  async findAll(venueId: string): Promise<ReviewDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { venue: { id: venueId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return this.mapper.mapArray(reviews, Review, ReviewDto);
  }

  private async findReviewEntity(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'venue'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findOne(id: string): Promise<ReviewDto> {
    const review = await this.findReviewEntity(id);
    return this.mapper.map(review, Review, ReviewDto);
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, user: User): Promise<ReviewDto> {
    const review = await this.findReviewEntity(id);
    if (review.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }
    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);
    return this.mapper.map(updatedReview, Review, ReviewDto);
  }

  async remove(id: string, user: User): Promise<void> {
    const review = await this.findReviewEntity(id);
    if (review.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewRepository.remove(review);
  }

  private async checkCompletedBooking(userId: string, venueId: string): Promise<boolean> {
    // Fetch all bookings for the user
    const bookings = await this.bookingService.findAll({ id: userId } as any);
    // Filter bookings for the specific venue
    return bookings.some(booking => booking.venue.id === venueId && booking.status === BookingStatus.COMPLETED);
  }
} 