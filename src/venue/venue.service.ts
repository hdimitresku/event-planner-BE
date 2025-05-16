import {Injectable, NotFoundException, ForbiddenException, forwardRef, Inject} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueQueryDto } from './dto/venue-query.dto';
import { ServiceService } from '@/service/service.service';
import { VenueDto } from './dto/venue.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @Inject(forwardRef(() => ServiceService))
    private readonly serviceService: ServiceService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createVenueDto: CreateVenueDto, host): Promise<VenueDto> {
    const venue = this.venueRepository.create({
      ...createVenueDto,
      owner: { id: host.userId },
    });
    const savedVenue = await this.venueRepository.save(venue);
    return this.mapper.map(savedVenue, Venue, VenueDto);
  }

  async findAll(query: VenueQueryDto): Promise<VenueDto[]> {
    const queryBuilder = this.venueRepository
        .createQueryBuilder('venue')
        .where('venue.isActive = :isActive', { isActive: true })
        .leftJoinAndSelect('venue.media', 'media')
        .leftJoinAndSelect('venue.owner', 'owner')
        .leftJoinAndSelect('venue.bookings', 'bookings')
        .orderBy('venue.createdAt', 'DESC')
        .skip(((query.page || 1) - 1) * (query.limit || 10))
        .take(query.limit || 10);

    // Location filter (address.city)
    if (query.location) {
      queryBuilder.andWhere("venue.address->>'city' ILIKE :location", {
        location: `%${query.location}%`,
      });
    }

    // Venue type filter
    if (query.venueTypes?.length) {
      queryBuilder.andWhere('venue.type IN (:...venueTypes)', {
        venueTypes: query.venueTypes,
      });
    } else if (query.type) {
      queryBuilder.andWhere('venue.type = :type', { type: query.type });
    }

    // Max price filter (price.amount)
    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere("(venue.price->>'amount')::numeric <= :maxPrice", {
        maxPrice: query.maxPrice,
      });
    }

    // Price type filter (price.type)
    if (query.priceTypes?.length) {
      queryBuilder.andWhere('venue.price->>\'type\' IN (:...priceTypes)', {
        priceTypes: query.priceTypes,
      });
    } else if (query.priceType) {
      queryBuilder.andWhere('venue.price->>\'type\' = :priceType', {
        priceType: query.priceType,
      });
    }

    // Guests filter (capacity.min and capacity.max)
    if (query.guests) {
      queryBuilder
          .andWhere("(venue.capacity->>'min')::numeric <= :guests", {
            guests: query.guests,
          })
          .andWhere("(venue.capacity->>'max')::numeric >= :guests", {
            guests: query.guests,
          });
    }

    // Amenities filter
    if (query.amenities?.length) {
      queryBuilder.andWhere('venue.amenities @> :amenities', {
        amenities: query.amenities,
      });
    }

    // Search filter (name)
    if (query.search) {
      queryBuilder.andWhere("venue.name->>'en' ILIKE :search", {
        search: `%${query.search}%`,
      });
    }

    const venues = await queryBuilder.getMany();
    return this.mapper.mapArray(venues, Venue, VenueDto);
  }

  async findByOwner(ownerId: string): Promise<VenueDto[]> {
    const venues = await this.venueRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['media', 'owner', 'bookings'],
    });
    return this.mapper.mapArray(venues, Venue, VenueDto);
    }

   async findVenueEntity(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['media', 'reviews', 'owner'],
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    return venue;
  }

  async findOne(id: string): Promise<VenueDto> {
    const venue = await this.findVenueEntity(id);

    // Get unique service types available for this venue type
    const availableServiceTypes = await this.serviceService.findByVenueType(venue.type);

    const venueWithServices = {
      ...venue,
      availableServiceTypes,
    };
    return this.mapper.map(venueWithServices, Venue, VenueDto);
  }

  async update(id: string, updateVenueDto: UpdateVenueDto, user): Promise<VenueDto> {
    const venue = await this.findVenueEntity(id);

    if (venue.owner.id !== user.userId) {
      throw new ForbiddenException('You can only update your own venues');
    }

    const updatedVenue = await this.venueRepository.save({
      ...venue,
      ...updateVenueDto,
    });
    
    return this.mapper.map(updatedVenue, Venue, VenueDto);
  }

  async remove(id: string, user): Promise<void> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['media', 'reviews', 'owner'],
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    if (venue.owner.id !== user.userId) {
      throw new ForbiddenException('You can only delete your own venues');
    }

    await this.venueRepository.remove(venue);
  }

  async updateAvailability(
    venueId: string,
    startDate: Date,
    endDate: Date,
    isConfirmed: boolean,
  ): Promise<void> {
    const venue = await this.findOne(venueId);
    
    await this.venueRepository.update(venueId, {
      metadata: {
        ...venue.metadata,
        blockedDates: [
          ...(venue.metadata?.blockedDates || []),
          {
            startDate,
            endDate,
            isConfirmed,
          },
        ],
      },
    });
  }
} 