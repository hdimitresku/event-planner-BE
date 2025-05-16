import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, ArrayContains } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { User } from '@/user/entities/user.entity';
import { ServiceType } from "@/shared/enums/service-type.enum";
import { VenueType } from "@/shared/enums/venue-type.enum";
import { ServiceOption } from './entities/service-option.entity';
import { Booking } from '@/booking/booking.entity';
import { BookingStatus } from '@/booking/booking.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ServiceDto } from './dto/service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceOption)
    private readonly serviceOptionRepository: Repository<ServiceOption>,
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

  async create(createServiceDto: CreateServiceDto, provider): Promise<ServiceDto> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      provider: { id: provider.userId },
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
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .innerJoin('service.availableVenues', 'venue', 'venue.id = :venueId', { venueId })
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.media', 'media')
      .where('service.isActive = :isActive', { isActive: true })
      .orderBy('service.createdAt', 'DESC')
      .getMany();
    return this.mapper.mapArray(services, Service, ServiceDto);
  }

  async findByVenueType(venueType: VenueType): Promise<ServiceType[]> {
    const services = await this.serviceRepository.find({
      where: {
        venueTypes: ArrayContains([venueType]),
        isActive: true
      },
      select: ['type']
    });
    return [...new Set(services.map(service => service.type))];
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