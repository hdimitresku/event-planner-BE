import {Injectable, NotFoundException, ForbiddenException, forwardRef, Inject} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, Like, Between, In, LessThanOrEqual, MoreThanOrEqual} from 'typeorm';
import {Venue} from './entities/venue.entity';
import {CreateVenueDto} from './dto/create-venue.dto';
import {UpdateVenueDto} from './dto/update-venue.dto';
import {VenueQueryDto} from './dto/venue-query.dto';
import {ServiceService} from '@/service/service.service';
import {VenueDto} from './dto/venue.dto';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {MediaEntityType} from "@/media/entities/media.entity";
import {ServiceType} from "@/shared/enums/service-type.enum";
import {dayOrder} from "@/shared/interfaces/venue-capacity.interface";

@Injectable()
export class VenueService {
    constructor(
        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
        @Inject(forwardRef(() => ServiceService))
        private readonly serviceService: ServiceService,
        @InjectMapper() private readonly mapper: Mapper,
    ) {
    }

    async create(createVenueDto: CreateVenueDto, userId: string): Promise<VenueDto> {
        const venue = this.venueRepository.create({
            ...createVenueDto,
            owner: {id: userId},
        });
        const savedVenue = await this.venueRepository.save(venue);
        return this.mapper.map(savedVenue, Venue, VenueDto);
    }

    async findAll(query: VenueQueryDto): Promise<VenueDto[]> {
        const queryBuilder = this.venueRepository
            .createQueryBuilder('venue')
            .where('venue.isActive = :isActive', {isActive: true})
            .leftJoinAndSelect(
                'venue.media',
                'media',
                'media.venue_id::uuid = venue.id AND media.entityType = :entityType',
                {entityType: MediaEntityType.VENUE},
            )
            .leftJoinAndSelect('venue.owner', 'owner')
            .leftJoinAndSelect('venue.bookings', 'bookings')
            .leftJoinAndSelect('venue.reviews', 'reviews')
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
            queryBuilder.andWhere('venue.type = :type', {type: query.type});
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
            where: {owner: {id: ownerId}},
            relations: ['media', 'owner', 'bookings', "bookings.serviceOptions"],
        });
        return this.mapper.mapArray(venues, Venue, VenueDto);
    }

    async findVenueEntity(id: string): Promise<Venue> {
        const venue = await this.venueRepository.findOne({
            where: {id},
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
        // Order availability days
        venue.dayAvailability = Object.fromEntries(
            dayOrder.map(day => [day, venue.dayAvailability[day] || ''])
        ) as typeof venue.dayAvailability;

        const venueWithServices = {
            ...venue,
            availableServiceTypes,
        };
        return this.mapper.map(venueWithServices, Venue, VenueDto);
    }


    async findOneEntity(id: string): Promise<Venue> {
        const venue = await this.findVenueEntity(id);

        // Get unique service types available for this venue type
        const availableServiceTypes = await this.serviceService.findByVenueType(venue.type);

        const venueWithServices = {
            ...venue,
            availableServiceTypes,
        };
        return venueWithServices
    }

    async update(id: string, updateVenueDto: UpdateVenueDto, userId: string): Promise<VenueDto> {
        const venue = await this.findVenueEntity(id);

        if (venue.owner.id !== userId) {
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
            where: {id},
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

    async findSimilarVenues(
        venueId: string,
        criteria: string[] = ['type'],
        limit = 3,
    ): Promise<VenueDto[]> {
        const currentVenue = await this.venueRepository.findOne({
            where: {id: venueId},
            relations: ['owner', 'media'],
        });
        if (!currentVenue) {
            throw new Error(`Venue with ID ${venueId} not found`);
        }

        // Build query for potential similar venues
        const query = this.venueRepository
            .createQueryBuilder('venue')
            .where('venue.id != :venueId', {venueId})
            .leftJoinAndSelect('venue.owner', 'owner')
            .leftJoinAndSelect('venue.media', 'media')
            .take(limit * 2); // Fetch more to filter later

        if (criteria.includes('type')) {
            query.andWhere('venue.type = :type', {type: currentVenue.type});
        }

        if (criteria.includes('location') && currentVenue.address?.city) {
            query.andWhere("venue.address ->> 'city' = :city", {city: currentVenue.address.city});
        }

        if (criteria.includes('capacity') && currentVenue.capacity?.recommended) {
            const recommended = currentVenue.capacity.recommended;
            const capacityRange = {
                min: Math.floor(recommended * 0.8),
                max: Math.ceil(recommended * 1.2),
            };
            query.andWhere("CAST(venue.capacity ->> 'recommended' AS INTEGER) BETWEEN :min AND :max", capacityRange);
        }

        if (criteria.includes('price') && currentVenue.price?.amount) {
            const amount = currentVenue.price.amount;
            const priceRange = {
                min: Math.floor(amount * 0.8),
                max: Math.ceil(amount * 1.2),
            };
            query
                .andWhere("venue.price ->> 'currency' = :currency", {currency: currentVenue.price.currency})
                .andWhere("venue.price ->> 'type' = :priceType", {priceType: currentVenue.price.type})
                .andWhere("CAST(venue.price ->> 'amount' AS FLOAT) BETWEEN :min AND :max", priceRange);
        }

        if (criteria.includes('amenities') && currentVenue.amenities?.length) {
            query.andWhere(
                "venue.amenities @> CAST(:amenities AS jsonb)",
                {amenities: JSON.stringify(currentVenue.amenities)}
            );
        }

        const potentialVenues = await query.getMany();
        if (!potentialVenues.length) return [];

        // Map to DTO and calculate matchCriteria, similarityScore
        const similarVenues = await Promise.all(
            potentialVenues.map(async (venue, index) => {
                // Always calculate matchCriteria for all criteria, regardless of filter

                const matchCriteria = {
                    venueType: venue.type === currentVenue.type,
                    location: venue.address?.city === currentVenue.address?.city,
                    capacity:
                        venue.capacity?.recommended &&
                        currentVenue.capacity?.recommended &&
                        venue.capacity.recommended >= Math.floor(currentVenue.capacity.recommended * 0.8) &&
                        venue.capacity.recommended <= Math.ceil(currentVenue.capacity.recommended * 1.2),
                    price:
                        venue.price?.amount &&
                        currentVenue.price?.amount &&
                        venue.price.currency === currentVenue.price.currency &&
                        venue.price.type === currentVenue.price.type &&
                        venue.price.amount >= Math.floor(currentVenue.price.amount * 0.8) &&
                        venue.price.amount <= Math.ceil(currentVenue.price.amount * 1.2),
                    amenities:
                        venue.amenities &&
                        currentVenue.amenities &&
                        venue.amenities.some(a => currentVenue.amenities.includes(a)),
                };

                const similarityScore = Object.values(matchCriteria).filter(Boolean).length;

                // Map to DTO and override fields
                const venueDto = this.mapper.map(venue, Venue, VenueDto);
                return {
                    ...venueDto,
                    matchCriteria,
                    similarityScore,
                };
            })
        );

        // Sort by similarityScore (descending) and take limit
        const result = similarVenues
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);

        return result;
    }
} 