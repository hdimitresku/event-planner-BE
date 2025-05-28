import {AutomapperProfile, InjectMapper} from '@automapper/nestjs';
import {Mapper, MappingProfile, createMap, forMember, mapWith, mapFrom} from '@automapper/core';
import {Injectable} from '@nestjs/common';
import {User} from '@/user/entities/user.entity';
import {UserDto} from '@/user/dto/user.dto';
import {VenueDto} from '@/venue/dto/venue.dto';
import {ServiceDto} from '@/service/dto/service.dto';
import {BookingDto} from '@/booking/dto/booking.dto';
import {ReviewDto} from '@/review/dto/review.dto';
import {MessageDto} from '@/message/dto/message.dto';
import {Message} from "@/message/message.entity";
import {Venue} from "@/venue/entities/venue.entity";
import {Service} from "@/service/entities/service.entity";
import {Review} from "@/review/review.entity";
import {Booking} from "@/booking/entities/booking.entity";
import {AddressInterface} from "@/shared/interfaces/address.interface";

@Injectable()
export class UserProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile(): MappingProfile {
        return (mapper) => {
            createMap(
                mapper,
                User,
                UserDto,
                forMember(
                    (dest) => dest.sentMessages,
                    mapWith(MessageDto, Message, (source) => source.sentMessages),
                ),
                forMember(
                    (dest) => dest.receivedMessages,
                    mapWith(MessageDto, Message, (source) => source.receivedMessages),
                ),
                forMember(
                    (dest) => dest.venues,
                    mapWith(VenueDto, Venue, (source) => source.venues),
                ),
                forMember(
                    (dest) => dest.services,
                    mapWith(ServiceDto, Service, (source) => source.services),
                ),
                forMember(
                    (dest) => dest.reviews,
                    mapWith(ReviewDto, Review, (source) => source.reviews),
                ),
                forMember(
                    (dest) => dest.address,
                    mapFrom((src) => src.address || {})
                ),
                forMember(
                    (dest) => dest.bookings,
                    mapWith(BookingDto, Booking, (source) => source.bookings),
                ),
            );
        };
    }
}