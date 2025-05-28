import {Injectable, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, Between, In} from 'typeorm';
import {Booking, BookingStatus} from './entities/booking.entity';
import {CreateBookingDto} from './dto/create-booking.dto';
import {UpdateBookingDto} from './dto/update-booking.dto';
import {User} from '../user/entities/user.entity';
import {VenueService} from '../venue/venue.service';
import {Venue} from '@/venue/entities/venue.entity';
import {ServiceOption} from '../service/entities/service-option.entity';
import {ServiceService} from '@/service/service.service';
import {checkServiceDayAvailability} from "@/booking/validators/booking-service-availability.validator";
import {checkVenueDayAvailability} from "@/booking/validators/booking-service-availability.validator";
import {UpdateBookingStatusDto} from './dto/update-booking-status.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { BookingDto } from './dto/booking.dto';
import {UserDto} from "@/user/dto/user.dto";
import {ServiceDto} from "@/service/dto/service.dto";
import {Service} from "@/service/entities/service.entity";
import {ServiceWithBookingsDto} from "@/service/dto/service-with-bookings.dto";

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(ServiceOption)
        private readonly serviceOptionRepository: Repository<ServiceOption>,
        private readonly venueService: VenueService,
        private readonly serviceService: ServiceService,
        @InjectMapper() private readonly mapper: Mapper,
    ) {
    }
    
    async create(createBookingDto: CreateBookingDto, user: UserDto): Promise<BookingDto> {
        const venue = await this.venueService.findVenueEntity(createBookingDto.venueId);
        const userId = user.id;

        // Check day availability for the venue
        if (venue.dayAvailability) {
            checkVenueDayAvailability(
                createBookingDto.startDate,
                createBookingDto.endDate,
                createBookingDto.startTime,
                createBookingDto.endTime,
                venue.dayAvailability
            );
        }

        // Check if the venue is available for the requested dates
        const isAvailable = await this.checkAvailability(
            venue.id,
            createBookingDto.startDate,
            createBookingDto.endDate,
        );

        if (!isAvailable) {
            throw new BadRequestException('Venue is not available for the selected dates');
        }

        // Get service options if provided
        let serviceOptions: ServiceOption[] = [];
        if (createBookingDto.serviceOptionIds?.length) {
            serviceOptions = await this.serviceOptionRepository.find({
                where: {
                    id: In(createBookingDto.serviceOptionIds),
                },
                relations: ['service'],
            });

            if (serviceOptions.length === 0) {
                throw new NotFoundException('One or more service options not found');
            }

            // Check day availability for each service
            for (const option of serviceOptions) {
                const service = await this.serviceService.findOne(option.service.id);
                if (service.dayAvailability) {
                    checkServiceDayAvailability(
                        createBookingDto.startDate,
                        createBookingDto.endDate,
                        createBookingDto.startTime,
                        createBookingDto.endTime,
                        service.dayAvailability
                    );
                }
            }

            // Check if all service options are available
            const areServicesAvailable = await this.checkServicesAvailability(
                serviceOptions,
                createBookingDto.startDate,
                createBookingDto.endDate,
            );

            if (!areServicesAvailable) {
                throw new BadRequestException('One or more services are not available for the selected dates');
            }
        }

        // Calculate total price based on venue price, service options, and duration
        const totalAmount = await this.calculateTotalPrice(venue, createBookingDto, serviceOptions);

        const booking = this.bookingRepository.create({
            ...createBookingDto,
            userId: userId,
            venueId: venue.id,
            user: user,
            totalAmount,
            status: BookingStatus.PENDING,
            serviceOptions,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        // Update availability for venue and services
        await this.updateAvailability(savedBooking);

        return this.mapper.map(savedBooking, Booking, BookingDto);
    }

    async findAll(userId: string): Promise<BookingDto[]> {
        const bookings = await this.bookingRepository.find({
            where: {userId},
            relations: ['venue', 'user', 'serviceOptions', 'serviceOptions.service'],
        });

        let bookingsDto = this.mapper.mapArray(bookings, Booking, BookingDto);
        bookingsDto.forEach(bookingDto => {
            bookingDto.serviceFee = bookingDto.totalAmount * (bookingDto.serviceFeePercentage / 100);
        })
        return bookingsDto;
    }

    async findAllBookingsByOwnedServices(userId: string): Promise<ServiceWithBookingsDto[]> {
        // Step 1: Retrieve service options for the user
        const serviceOptions = await this.serviceOptionRepository.find({
            where: { service: { provider: { id: userId } } },
            relations: ['service', 'service.provider'],
        });

        if (serviceOptions.length === 0) {
            throw new NotFoundException('No service options found for the user');
        }

        // Step 2: Group service options by their service
        const serviceMap = new Map<string, { service: any; options: any[] }>();
        serviceOptions.forEach(option => {
            const serviceId = option.service.id;
            if (!serviceMap.has(serviceId)) {
                serviceMap.set(serviceId, { service: option.service, options: [] });
            }
            serviceMap.get(serviceId)!.options.push(option);
        });

        // Step 3: Fetch bookings for all service options
        const serviceOptionIds = serviceOptions.map(option => option.id);
        const bookings = await this.bookingRepository.find({
            where: { serviceOptions: { id: In(serviceOptionIds) } },
            relations: ['venue', 'user', 'serviceOptions', 'serviceOptions.service'],
        });

        // Step 4: Map bookings to their respective services
        const servicesWithBookings = Array.from(serviceMap.values()).map(({ service, options }) => {
            // Find bookings for this service's options
            const serviceOptionIds = options.map(option => option.id);
            const serviceBookings = bookings.filter(booking =>
                booking.serviceOptions.some(option => serviceOptionIds.includes(option.id))
            );

            // Map bookings to BookingDto and calculate serviceFee
            const bookingsDto = this.mapper.mapArray(serviceBookings, Booking, BookingDto);
            bookingsDto.forEach(bookingDto => {
                bookingDto.serviceFee = bookingDto.totalAmount * (bookingDto.serviceFeePercentage / 100);
            });

            // Map service to ServiceDto and include bookings
            const serviceDto = this.mapper.map(service, Service, ServiceDto);
            return {
                ...serviceDto,
                bookings: bookingsDto,
            };
        });

        return servicesWithBookings;
    }

    async findAllByVenue(userId: string, venueId: string): Promise<BookingDto[]> {
        const bookings = await this.bookingRepository.find({
            where: {userId, venueId},
            relations: ['venue', 'user', 'serviceOptions', 'serviceOptions.service'],
        });

        let bookingsDto = this.mapper.mapArray(bookings, Booking, BookingDto);
        bookingsDto.forEach(bookingDto => {
            bookingDto.serviceFee = bookingDto.totalAmount * (bookingDto.serviceFeePercentage / 100);
        })
        return bookingsDto;
    }

    private async findBookingEntity(id: string): Promise<Booking> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['venue', 'venue.owner', 'user', 'serviceOptions', 'serviceOptions.service', 'serviceOptions.service.provider'],
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async findOne(id: string, user: User): Promise<BookingDto> {
        const booking = await this.findBookingEntity(id);
        
        if (booking.user.id !== user.id && booking.venue.owner.id !== user.id) {
            throw new ForbiddenException('You do not have permission to view this booking');
        }

        let bookingDto = this.mapper.map(booking, Booking, BookingDto);
        bookingDto.serviceFee = bookingDto.totalAmount * (bookingDto.serviceFeePercentage / 100);
        return bookingDto;
    }

    async update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<BookingDto> {
        const booking = await this.findOne(id, user);

        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot update a completed booking');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('Cannot update a cancelled booking');
        }

        const oldStatus = booking.status;
        Object.assign(booking, updateBookingDto);
        const updatedBooking = await this.bookingRepository.save(booking);

        // If status changed, update availability
        if (oldStatus !== updatedBooking.status) {
            await this.updateAvailability(updatedBooking);
        }

        return this.mapper.map(updatedBooking, Booking, BookingDto);
    }

    async remove(id: string, user: User): Promise<void> {
        const booking = await this.findBookingEntity(id);
        if (booking.user.id !== user.id) {
            throw new ForbiddenException('You can only delete your own bookings');
        }
        await this.bookingRepository.remove(booking);
    }

    private async checkAvailability(
        venueId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<boolean> {
        // Get the venue to check its blocked dates
        const venue = await this.venueService.findOne(venueId);

        // Check if the dates overlap with any blocked dates in metadata
        if (venue.metadata?.blockedDates) {
            for (const blockedDate of venue.metadata.blockedDates) {
                const blockedStart = new Date(blockedDate.startDate);
                const blockedEnd = new Date(blockedDate.endDate);

                if (
                    (startDate >= blockedStart && startDate <= blockedEnd) ||
                    (endDate >= blockedStart && endDate <= blockedEnd) ||
                    (startDate <= blockedStart && endDate >= blockedEnd)
                ) {
                    return false;
                }
            }
        }

        // Check for any conflicting bookings (both pending and confirmed)
        const conflictingBookings = await this.bookingRepository.find({
            where: [
                {
                    venueId,
                    status: BookingStatus.CONFIRMED,
                    startDate: Between(startDate, endDate),
                },
                {
                    venueId,
                    status: BookingStatus.PENDING,
                    startDate: Between(startDate, endDate),
                },
            ],
        });

        return conflictingBookings.length === 0;
    }

    private async calculateTotalPrice(
        venue: Venue,
        booking: CreateBookingDto,
        serviceOptions: ServiceOption[]
    ): Promise<number> {
        const days = Math.ceil(
            (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const [startHour] = booking.startTime.split(':').map(Number);
        const [endHour] = booking.endTime.split(':').map(Number);
        const hours = endHour - startHour;

        // Calculate venue price
        let venuePrice = 0;
        if (venue.price.type === 'hourly') {
            venuePrice = venue.price.amount * days * hours;
        } else if (venue.price.type === 'perPerson') {
            venuePrice = venue.price.amount * booking.numberOfGuests;
        } else {
            venuePrice = venue.price.amount;
        }

        // Calculate service options prices
        const serviceOptionsPrice = serviceOptions.reduce((total, option) => {
            if (option.price.type === 'hourly') {
                return total + (option.price.amount * days * hours);
            } else if (option.price.type === 'perPerson') {
                return total + (option.price.amount * booking.numberOfGuests);
            } else {
                return total + option.price.amount;
            }
        }, 0);

        return venuePrice + serviceOptionsPrice;
    }

    private async checkServicesAvailability(
        serviceOptions: ServiceOption[],
        startDate: Date,
        endDate: Date,
    ): Promise<boolean> {
        for (const option of serviceOptions) {
            const service = await this.serviceService.findOne(option.service.id);

            // Check if the dates overlap with any blocked dates in metadata
            if (service.metadata?.blockedDates) {
                for (const blockedDate of service.metadata.blockedDates) {
                    const blockedStart = new Date(blockedDate.startDate);
                    const blockedEnd = new Date(blockedDate.endDate);

                    if (
                        (startDate >= blockedStart && startDate <= blockedEnd) ||
                        (endDate >= blockedStart && endDate <= blockedEnd) ||
                        (startDate <= blockedStart && endDate >= blockedEnd)
                    ) {
                        return false;
                    }
                }
            }

            // Check for any conflicting bookings
            const conflictingBookings = await this.bookingRepository.find({
                where: [
                    {
                        serviceOptions: { service: { id: service.id } },
                        status: BookingStatus.CONFIRMED,
                        startDate: Between(startDate, endDate),
                    },
                    {
                        serviceOptions: { service: { id: service.id } },
                        status: BookingStatus.PENDING,
                        startDate: Between(startDate, endDate),
                    },
                ],
            });

            if (conflictingBookings.length > 0) {
                return false;
            }
        }

        return true;
    }

    private async updateAvailability(booking: Booking): Promise<void> {
        // Update venue availability
        await this.venueService.updateAvailability(
            booking.venueId,
            booking.startDate,
            booking.endDate,
            booking.status === BookingStatus.CONFIRMED,
        );

        // Update service availability for each service option
        for (const option of booking.serviceOptions) {
            await this.serviceService.updateAvailability(
                option.service.id,
                booking.startDate,
                booking.endDate,
                booking.status === BookingStatus.CONFIRMED,
            );
        }
    }

    async updateVenueBookingStatus(
        bookingId: string,
        updateStatusDto: UpdateBookingStatusDto,
        venueOwner,
    ) {
        const booking = await this.findBookingEntity(bookingId);

        if (booking.venue.owner.id !== venueOwner.userId) {
            throw new ForbiddenException('You can only update bookings for your own venues');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot update a completed booking');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('Cannot update a cancelled booking');
        }

        const oldStatus = booking.status;
        Object.assign(booking, updateStatusDto);
        const updatedBooking = await this.bookingRepository.save(booking);

        // If status changed, update availability
        if (oldStatus !== updatedBooking.status) {
            await this.updateAvailability(updatedBooking);
        }

        return this.mapper.map(updatedBooking, Booking, BookingDto);
    }

    async updateServiceBookingStatus(
        bookingId: string,
        serviceId: string,
        updateStatusDto: UpdateBookingStatusDto,
        serviceOwner,
    ) {
        const booking = await this.findBookingEntity(bookingId);

        // Check if the service owner is the provider of any of the booking's services
        const isServiceProvider = booking.serviceOptions.some(
            option => option.service.provider.id === serviceOwner.userId,
        );

        if (!isServiceProvider) {
            throw new ForbiddenException('You can only update bookings for your own services');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot update a completed booking');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('Cannot update a cancelled booking');
        }

        const oldStatus = booking.status;
        Object.assign(booking, updateStatusDto);
        const updatedBooking = await this.bookingRepository.save(booking);

        // If status changed, update availability
        if (oldStatus !== updatedBooking.status) {
            await this.updateAvailability(updatedBooking);
        }

        return this.mapper.map(updatedBooking, Booking, BookingDto);
    }
} 