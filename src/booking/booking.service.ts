import {BadRequestException, ForbiddenException, Injectable, NotFoundException, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Between, In, LessThan, Repository} from 'typeorm';
import {Booking, BookingStatus} from './entities/booking.entity';
import {CreateBookingDto} from './dto/create-booking.dto';
import {UpdateBookingDto} from './dto/update-booking.dto';
import {User} from '../user/entities/user.entity';
import {VenueService} from '../venue/venue.service';
import {Venue} from '@/venue/entities/venue.entity';
import {ServiceOption} from '../service/entities/service-option.entity';
import {ServiceService} from '@/service/service.service';
import {NotificationService} from '../notification/notification.service';
import {
    checkServiceDayAvailability,
    checkVenueDayAvailability
} from "@/booking/validators/booking-service-availability.validator";
import {UpdateBookingStatusDto} from './dto/update-booking-status.dto';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {BookingDto} from './dto/booking.dto';
import {UserDto} from "@/user/dto/user.dto";
import {ServiceDto} from "@/service/dto/service.dto";
import {Service} from "@/service/entities/service.entity";
import {ServiceWithBookingsDto} from "@/service/dto/service-with-bookings.dto";
import {Cron} from '@nestjs/schedule';
import {UserService} from "@/user/user.service";

@Injectable()
export class BookingService {
    private readonly logger = new Logger(BookingService.name);

    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(ServiceOption)
        private readonly serviceOptionRepository: Repository<ServiceOption>,
        private readonly venueService: VenueService,
        private readonly serviceService: ServiceService,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        @InjectMapper() private readonly mapper: Mapper,
    ) {
    }

    async create(createBookingDto: CreateBookingDto, user: UserDto): Promise<BookingDto> {
        const venue = await this.venueService.findVenueEntity(createBookingDto.venueId);
        const userEntity = await this.userService.findById(user.id);
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
                relations: ['service', 'service.provider'],
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
            venue: venue,
            user: userEntity,
            totalAmount,
            status: BookingStatus.PENDING,
            serviceOptions,
        });

        // Send notifications
        await this.notificationService.handleBookingCreation(booking);

        const savedBooking = await this.bookingRepository.save(booking);

        // Update availability for venue and services
        await this.updateAvailability(savedBooking);
        return this.mapper.map(savedBooking, Booking, BookingDto);
    }

    async findAll(userId: string): Promise<BookingDto[]> {
        const bookings = await this.bookingRepository.find({
            where: {userId},
            relations: ['venue', 'venue.media', 'user', 'serviceOptions', 'serviceOptions.service'],
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
            where: {service: {provider: {id: userId}}},
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
                serviceMap.set(serviceId, {service: option.service, options: []});
            }
            serviceMap.get(serviceId)!.options.push(option);
        });

        // Step 3: Fetch bookings for all service options
        const serviceOptionIds = serviceOptions.map(option => option.id);
        const bookings = await this.bookingRepository.find({
            where: {serviceOptions: {id: In(serviceOptionIds)}},
            relations: ['venue', 'user', 'serviceOptions', 'serviceOptions.service'],
        });

        // Step 4: Map bookings to their respective services
        const servicesWithBookings = Array.from(serviceMap.values()).map(({service, options}) => {
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
            where: {id},
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
            (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24),
        );

        const [startHour] = booking.startTime.split(':').map(Number);
        const [endHour] = booking.endTime.split(':').map(Number);
        const hours = endHour - startHour;

        // Calculate venue price
        let venuePrice = 0;
        if (venue.price.type === 'hourly') {
            venuePrice = venue.price.amount * (days == 0 ? 1 : days) * hours;
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

            // Check if the dates overlap with any blocked dates in metadata
            if (option.metadata?.blockedDates) {
                for (const blockedDate of option.metadata.blockedDates) {
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
                        serviceOptions: option,
                        status: BookingStatus.CONFIRMED,
                        startDate: Between(startDate, endDate),
                    },
                    {
                        serviceOptions: option,
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
        const venue = await this.venueService.findOne(booking.venueId);
        if (venue.metadata?.blockedDates && booking.status === BookingStatus.CANCELLED) {
            // Remove this booking's dates from blocked dates
            venue.metadata.blockedDates = venue.metadata.blockedDates.filter(
                blockedDate =>
                    !(new Date(blockedDate.startDate).getTime() === new Date(booking.startDate).getTime() &&
                        new Date(blockedDate.endDate).getTime() === new Date(booking.endDate).getTime())
            );
        } else {
            // Ensure metadata and blockedDates are initialized
            if (!venue.metadata) {
                venue.metadata = {};
            }

            if (!venue.metadata.blockedDates) {
                venue.metadata.blockedDates = [];
            }

            // Add this booking's dates to blocked dates if not already present
            const bookingDates = {
                startDate: booking.startDate,
                endDate: booking.endDate,
                bookingId: booking.id
            };

            const isAlreadyBlocked = venue.metadata.blockedDates.some(
                blockedDate =>
                    new Date(blockedDate.startDate).getTime() === new Date(booking.startDate).getTime() &&
                    new Date(blockedDate.endDate).getTime() === new Date(booking.endDate).getTime()
            );

            if (!isAlreadyBlocked) {
                venue.metadata.blockedDates.push(bookingDates);
            }
        }

        await this.venueService.update(venue.id, {metadata: venue.metadata}, venue.owner.id);

        // Update service availability for each service option
        for (const option of booking.serviceOptions) {
            const service = await this.serviceService.findOneEntity(option.service.id);
            if (service.metadata?.blockedDates) {
                if (booking.status === BookingStatus.CANCELLED) {
                    // Remove this booking's dates from blocked dates
                    service.metadata.blockedDates = service.metadata.blockedDates.filter(
                        blockedDate =>
                            !(new Date(blockedDate.startDate).getTime() === new Date(booking.startDate).getTime() &&
                                new Date(blockedDate.endDate).getTime() === new Date(booking.endDate).getTime())
                    );
                } else {
                    // Add this booking's dates to blocked dates if not already present
                    const bookingDates = {
                        startDate: booking.startDate,
                        endDate: booking.endDate,
                        bookingId: booking.id,
                        serviceOptionId: option.id
                    };

                    if (!service.metadata.blockedDates.some(
                        blockedDate =>
                            new Date(blockedDate.startDate).getTime() === new Date(booking.startDate).getTime() &&
                            new Date(blockedDate.endDate).getTime() === new Date(booking.endDate).getTime()
                    )) {
                        service.metadata.blockedDates.push(bookingDates);
                    }
                }
                await this.serviceService.update(service.id, {metadata: service.metadata}, service.provider.id);
            }
        }

        // Update booking metadata
        if (booking.status === BookingStatus.CANCELLED) {
            const existingOptions = booking.metadata?.options || [];
            const updatedOptions = existingOptions.map(option => ({
                ...option,
                status: BookingStatus.CANCELLED,
                rejectionReason: 'Automatically cancelled due to booking cancellation'
            }));

            booking.metadata = {
                ...booking.metadata,
                options: updatedOptions
            };

            await this.bookingRepository.save(booking);
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

        // If the venue is cancelling the booking, automatically cancel all service options
        if (updateStatusDto.status === BookingStatus.CANCELLED) {
            // Get existing options from metadata or initialize empty array
            const existingOptions = booking.metadata?.options || [];

            // Process each service option
            for (const option of booking.serviceOptions) {
                // Skip if this service option has already been processed
                if (existingOptions.some(existing => existing.id === option.id)) {
                    continue;
                }

                // Add new option to the array with cancelled status
                const newOption = {
                    serviceId: option.service.id,
                    id: option.id,
                    status: BookingStatus.CANCELLED,
                    rejectionReason: 'Automatically cancelled due to venue cancellation'
                };

                existingOptions.push(newOption);
            }

            // Update the booking metadata with all cancelled options
            booking.metadata = {
                ...booking.metadata,
                options: existingOptions
            };
        }

        const updatedBooking = await this.bookingRepository.save(booking);

        // If status changed, update availability
        if (oldStatus !== updatedBooking.status) {
            await this.updateAvailability(updatedBooking);
        }

        // Send notifications
        await this.notificationService.handleVenueStatusUpdate(updatedBooking);
        if (updateStatusDto.status === BookingStatus.CANCELLED) {
            await this.notificationService.handleServiceStatusUpdate(updatedBooking);
        }

        return this.mapper.map(updatedBooking, Booking, BookingDto);
    }

    async updateServiceBookingStatus(
        bookingId: string,
        serviceId: string,
        updateStatusDto: UpdateBookingStatusDto,
        serviceOwner: UserDto,
    ) {
        const booking = await this.findBookingEntity(bookingId);

        // Check if the service owner is the provider of any of the booking's services
        const isServiceProvider = booking.serviceOptions.some(
            option => option.service.provider.id === serviceOwner.id,
        );

        // Find the specific service option
        const option: ServiceOption = booking.serviceOptions.find(option =>
            option.service.id === serviceId
        );

        if (!option) {
            throw new BadRequestException('Service option not found in this booking');
        }

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
        if (updateStatusDto.status === BookingStatus.CANCELLED) {
            // Initialize options array if it doesn't exist
            const existingOptions = booking.metadata?.options || [];

            // Add new option to the array
            const newOption = {
                serviceId: serviceId,
                id: option.id,
                status: updateStatusDto.status,
                rejectionReason: updateStatusDto.rejectionReason
            };

            booking.metadata = {
                ...booking.metadata,
                options: [...existingOptions, newOption]
            };

            const newOptions = booking.serviceOptions.filter(opt => opt.id !== option.id);
            booking.totalAmount = await this.calculateTotalPrice(booking.venue, booking, newOptions);
        } else if (updateStatusDto.status === BookingStatus.CONFIRMED) {
            // Initialize options array if it doesn't exist
            const existingOptions = booking.metadata?.options || [];

            // Add new option to the array
            const newOption = {
                serviceId: serviceId,
                id: option.id,
                status: updateStatusDto.status
            };

            booking.metadata = {
                ...booking.metadata,
                options: [...existingOptions, newOption]
            };
        }

        const updatedBooking = await this.bookingRepository.save(booking);

        // If status changed, update availability
        if (oldStatus !== updatedBooking.status) {
            await this.updateAvailability(updatedBooking);
        }

        // Send notifications
        await this.notificationService.handleServiceStatusUpdate(updatedBooking);

        return this.mapper.map(updatedBooking, Booking, BookingDto);
    }

    @Cron('3 0 * * *') // Runs at 12:00 PM every day
    async updateBookingStatuses() {
        const now = new Date();

        // Update confirmed bookings that have ended to completed
        await this.bookingRepository.update(
            {
                status: BookingStatus.CONFIRMED,
                endDate: LessThan(now),
            },
            {
                status: BookingStatus.COMPLETED,
            },
        );

        // Update pending bookings that have ended to cancelled
        await this.bookingRepository.update(
            {
                status: BookingStatus.PENDING,
                endDate: LessThan(now),
            },
            {
                status: BookingStatus.CANCELLED,
            },
        );
    }

    @Cron('25 0 * * *') // Runs at 12:00 PM every day
    async updateServiceBookingStatuses() {
        const now = new Date();
        this.logger.log('Starting service booking status update cron job');

        try {
            // Find all bookings with service options that have ended
            const bookings = await this.bookingRepository.find({
                where: {
                    endDate: LessThan(now),
                    status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED]),
                },
                relations: ['serviceOptions', 'serviceOptions.service'],
            });

            for (const booking of bookings) {
                // Get existing options from metadata or initialize empty array
                const existingOptions = booking.metadata?.options || [];

                // Process each service option
                for (const option of booking.serviceOptions) {
                    // Skip if this service option has already been processed
                    if (existingOptions.some(existing => existing.id === option.id)) {
                        continue;
                    }

                    // Add new option to the array with appropriate status
                    const newOption = {
                        serviceId: option.service.id,
                        id: option.id,
                        status: booking.status === BookingStatus.CONFIRMED ?
                            BookingStatus.COMPLETED :
                            BookingStatus.CANCELLED,
                        rejectionReason: booking.status === BookingStatus.PENDING ?
                            'Automatically cancelled due to end date passing' :
                            undefined
                    };

                    booking.metadata = {
                        ...booking.metadata,
                        options: [...existingOptions, newOption]
                    };

                    // If the booking was pending, remove the service option and recalculate total
                    if (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CANCELLED) {
                        const newOptions = booking.serviceOptions.filter(opt => opt.id !== option.id);
                        booking.totalAmount = await this.calculateTotalPrice(booking.venue, booking, newOptions);
                    }
                }

                // Save the updated booking
                await this.bookingRepository.save(booking);
                this.logger.log(`Updated service booking statuses for booking ${booking.id}`);
            }

            this.logger.log('Completed service booking status update cron job');
        } catch (error) {
            this.logger.error(`Error in service booking status update cron job: ${error.message}`);
            throw error;
        }
    }
} 