import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Booking } from '@/booking/entities/booking.entity';
import { Venue } from '../venue/entities/venue.entity';
import { ExternalReview } from '../external-review/entities/external-review.entity';
import { AnalyticsLog } from './analytics-log.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { AnalyticsLogDto } from './dto/analytics-log.dto';
import { CreateAnalyticsLogDto } from './dto/create-analytics-log.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(ExternalReview)
    private reviewRepository: Repository<ExternalReview>,
    @InjectRepository(AnalyticsLog)
    private analyticsLogRepository: Repository<AnalyticsLog>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async logAnalytics(createAnalyticsLogDto: CreateAnalyticsLogDto): Promise<AnalyticsLogDto> {
    const analyticsLog = this.analyticsLogRepository.create(createAnalyticsLogDto);
    const savedLog = await this.analyticsLogRepository.save(analyticsLog);
    return this.mapper.map(savedLog, AnalyticsLog, AnalyticsLogDto);
  }

  async getAnalyticsLogs(userId?: string): Promise<AnalyticsLogDto[]> {
    const where = userId ? { userId } : {};
    const logs = await this.analyticsLogRepository.find({ where });
    return this.mapper.mapArray(logs, AnalyticsLog, AnalyticsLogDto);
  }

  async getVenuePerformanceMetrics(venueId: string, startDate: Date, endDate: Date) {
    const bookings = await this.bookingRepository.find({
      where: {
        venueId,
        createdAt: Between(startDate, endDate),
      },
    });

    const reviews = await this.reviewRepository.find({
      where: {
        venueId,
        externalCreatedAt: Between(startDate, endDate),
      },
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

    const bookingTrends = await this.getBookingTrends(venueId, startDate, endDate);
    const revenueTrends = await this.getRevenueTrends(venueId, startDate, endDate);

    return {
      totalBookings,
      totalRevenue,
      averageRating,
      bookingTrends,
      revenueTrends,
      reviewCount: reviews.length,
    };
  }

  private async getBookingTrends(venueId: string, startDate: Date, endDate: Date) {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('DATE(booking.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('booking.venueId = :venueId', { venueId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return bookings;
  }

  private async getRevenueTrends(venueId: string, startDate: Date, endDate: Date) {
    const revenue = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('DATE(booking.createdAt)', 'date')
      .addSelect('SUM(booking.totalAmount)', 'total')
      .where('booking.venueId = :venueId', { venueId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return revenue;
  }

  async getHostDashboardMetrics(hostId: string, startDate: Date, endDate: Date) {
    const venues = await this.venueRepository.find({
      where: { owner: { id: hostId } },
    });

    const venueIds = venues.map(venue => venue.id);
    
    const bookings = await this.bookingRepository.find({
      where: {
        venueId: In(venueIds),
        createdAt: Between(startDate, endDate),
      },
    });

    const totalVenues = venues.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    const venuePerformance = await Promise.all(
      venues.map(async venue => ({
        venueId: venue.id,
        venueName: venue.name,
        ...(await this.getVenuePerformanceMetrics(venue.id, startDate, endDate)),
      })),
    );

    return {
      totalVenues,
      totalBookings,
      totalRevenue,
      venuePerformance,
    };
  }
} 