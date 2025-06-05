import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../user/entities/user.entity';
import { Booking } from '../booking/entities/booking.entity';
import { ServiceOption } from '../service/entities/service-option.entity';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendVenueStatusUpdateEmail(user: User, booking: Booking): Promise<void> {
        await this.mailerService.sendMail({
            to: user.email,
            subject: `Booking Status Update - ${booking.venue.name.en}`,
            template: 'booking-status-update',
            context: {
                user,
                booking,
                venue: booking.venue,
                status: booking.status,
            },
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'uploads/logo.png',
                    cid: 'rezervoLogo',
                },
            ],
        });
    }

    async sendServiceErrorEmail(user: User, affectedServices: ServiceOption[], booking: Booking): Promise<void> {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Service Issue in Your Booking',
            template: 'service-error',
            context: {
                user,
                affectedServices,
                booking,
                venue: booking.venue,
            },
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'uploads/logo.png',
                    cid: 'rezervoLogo',
                },
            ],
        });
    }

    async sendBookingConfirmationEmail(user: User, booking: Booking): Promise<void> {
        await this.mailerService.sendMail({
            to: user.email,
            subject: `Booking Confirmation - ${booking.venue.name.en}`,
            template: 'booking-confirmation',
            context: {
                user,
                booking,
                venue: booking.venue,
            },
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'uploads/logo.png',
                    cid: 'rezervoLogo',
                },
            ],
        });
    }

    async sendVenueOwnerNotificationEmail(venueOwner: User, booking: Booking): Promise<void> {
        await this.mailerService.sendMail({
            to: venueOwner.email,
            subject: `New Booking at ${booking.venue.name.en}`,
            template: 'venue-owner-notification',
            context: {
                venueOwner,
                booking,
                venue: booking.venue,
            },
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'uploads/logo.png',
                    cid: 'rezervoLogo',
                },
            ],
        });
    }

    async sendServiceProviderNotificationEmail(serviceProvider: User, booking: Booking, serviceOption: ServiceOption): Promise<void> {
        await this.mailerService.sendMail({
            to: serviceProvider.email,
            subject: `New Service Request - ${serviceOption.service.name.en}`,
            template: 'service-provider-notification',
            context: {
                serviceProvider,
                booking,
                venue: booking.venue,
                serviceOption,
            },
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'uploads/logo.png',
                    cid: 'rezervoLogo',
                },
            ],
        });
    }
} 