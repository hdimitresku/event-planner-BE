import {Injectable, NotFoundException, ForbiddenException, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, ArrayContains } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { User } from '@/user/entities/user.entity';
import {iconMap, ServiceType} from "@/shared/enums/service-type.enum";
import { VenueType } from "@/shared/enums/venue-type.enum";
import { ServiceOption } from './entities/service-option.entity';
import { Booking } from '@/booking/entities/booking.entity';
import { BookingStatus } from '@/booking/entities/booking.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ServiceDto } from './dto/service.dto';
import {MediaEntityType} from "@/media/entities/media.entity";
import {VenueService} from "@/venue/venue.service";

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceOption)
    private readonly serviceOptionRepository: Repository<ServiceOption>,
    @Inject(forwardRef(() => VenueService))
    private readonly venueService: VenueService,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  private async findServiceEntity(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider', 'options', 'media'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }



  async create(createServiceDto: CreateServiceDto, userId: string): Promise<ServiceDto> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      icon: iconMap[createServiceDto.type],
      provider: { id: userId },
    });
    const savedService = await this.serviceRepository.save(service);
    const fullService = await this.findServiceEntity(savedService.id);
    return this.mapper.map(fullService, Service, ServiceDto);
  }

  async findAll(query: ServiceQueryDto): Promise<ServiceDto[]> {
    const where: any = { isActive: true };

    if (query.type) {
      where.type = query.type;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = Between(query.minPrice || 0, query.maxPrice || Number.MAX_SAFE_INTEGER);
    }

    if (query.priceType) {
      where.priceType = query.priceType;
    }

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    if (query.venueTypes?.length) {
      where.venueTypes = In(query.venueTypes);
    }

    const services = await this.serviceRepository.find({
      where,
      relations: ['provider', 'options', 'media'],
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(services, Service, ServiceDto);
  }

  async findOwned(userId: string): Promise<ServiceDto[]> {
    const services = await this.serviceRepository.find({
      where: { provider: { id: userId }, isActive: true },
      relations: ['provider', 'options', 'media'],
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(services, Service, ServiceDto);
  }

  async findByType(type: string): Promise<ServiceDto[]> {
    const services = await this.serviceRepository.find({
      relations: ['provider', 'options', 'media'],
      where: { type: type as ServiceType, isActive: true },
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(services, Service, ServiceDto);
  }

  async findOne(id: string): Promise<ServiceDto> {
    const service = await this.findServiceEntity(id);
    return this.mapper.map(service, Service, ServiceDto);
  }

  async findOneEntity(id: string): Promise<Service> {
    return await this.findServiceEntity(id);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, provider: User): Promise<ServiceDto> {
    const service = await this.findServiceEntity(id);
    if (service.provider.id !== provider.id) {
      throw new ForbiddenException('You can only update your own services');
    }
    Object.assign(service, updateServiceDto);
    const updatedService = await this.serviceRepository.save(service);
    const fullService = await this.findServiceEntity(updatedService.id);
    return this.mapper.map(fullService, Service, ServiceDto);
  }

  async remove(id: string, provider: User): Promise<void> {
    const service = await this.findServiceEntity(id);
    if (service.provider.id !== provider.id) {
      throw new ForbiddenException('You can only delete your own services');
    }
    await this.serviceRepository.remove(service);
  }

  async findByVenue(venueId: string): Promise<ServiceDto[]> {
    // Step 1: Fetch the venue to get its type
    const venue = await this.venueService.findOneEntity(venueId);
    if (!venue) {
      throw new Error(`Venue with ID ${venueId} not found`);
    }

    // Step 2: Query services where venueTypes includes venue.type
    const services = await this.serviceRepository
        .createQueryBuilder('service')
        .where('service.isActive = :isActive', { isActive: true })
        .andWhere(':venueType = ANY(service.venueTypes)', { venueType: venue.type })
        .leftJoinAndSelect('service.provider', 'provider')
        .leftJoinAndSelect('service.options', 'options')
        .leftJoinAndSelect(
            'service.media',
            'media',
            'media.service_id::uuid = service.id AND media.entityType = :entityType',
            { entityType: MediaEntityType.SERVICE },
        )
        .orderBy('service.createdAt', 'DESC')
        .getMany();

    const result = this.mapper.mapArray(services, Service, ServiceDto);

    return result;
  }

  async findByVenueType(venueType: VenueType): Promise<{ type: ServiceType; icon: string }[]> {
    const services = await this.serviceRepository.find({
      where: {
        venueTypes: ArrayContains([venueType]),
        isActive: true,
      },
      select: ['type', 'icon'],
    });
    return services;
  }


  async checkAvailability(serviceId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const service = await this.findOne(serviceId);
    const conflictingBookings = await this.bookingRepository.find({
      where: {
        serviceOptions: { service: { id: serviceId } },
        status: BookingStatus.CONFIRMED,
        startDate: Between(startDate, endDate),
      },
    });
    return conflictingBookings.length === 0;
  }

  async updateAvailability(
    serviceId: string,
    startDate: Date,
    endDate: Date,
    isConfirmed: boolean,
  ): Promise<void> {
    const service = await this.findOne(serviceId);
    
    await this.serviceRepository.update(serviceId, {
      metadata: {
        ...service.metadata,
        blockedDates: [
          ...(service.metadata?.blockedDates || []),
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