import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from '@automapper/core';
import { User } from '@/user/entities/user.entity';
import { UserDto } from '@/user/dto/user.dto';
import { Venue } from '@/venue/entities/venue.entity';
import { VenueDto } from '@/venue/dto/venue.dto';
import { ServiceOption } from '@/service/entities/service-option.entity';
import {Booking} from "@/booking/entities/booking.entity";
import {BookingDto} from "@/booking/dto/booking.dto";
import {ServiceOptionDto} from "@/service/dto/service-option-dto";

@Injectable()
export class BookingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      // Booking to BookingDto
      createMap(
          mapper,
          Booking,
          BookingDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.venue,
              mapFrom((src) => (src.venue ? this.mapper.map(src.venue, Venue, VenueDto) : null))
          ),
          forMember(
              (dest) => dest.userId,
              mapFrom((src) => src.userId)
          ),
          forMember(
              (dest) => dest.startDate,
              mapFrom((src) => src.startDate)
          ),
          forMember(
              (dest) => dest.endDate,
              mapFrom((src) => src.endDate)
          ),
          forMember(
              (dest) => dest.startTime,
              mapFrom((src) => src.startTime)
          ),
          forMember(
              (dest) => dest.endTime,
              mapFrom((src) => src.endTime)
          ),
          forMember(
              (dest) => dest.totalAmount,
              mapFrom((src) => src.totalAmount)
          ),
          forMember(
              (dest) => dest.status,
              mapFrom((src) => src.status)
          ),
          forMember(
              (dest) => dest.specialRequests,
              mapFrom((src) => src.specialRequests || null)
          ),
          forMember(
              (dest) => dest.numberOfGuests,
              mapFrom((src) => src.numberOfGuests)
          ),
          forMember(
              (dest) => dest.serviceOptions,
              mapFrom((src) => this.mapper.mapArray(src.serviceOptions || [], ServiceOption, ServiceOptionDto))
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata || {})
          ),
          forMember(
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          )
      );

      // BookingDto to Booking
      createMap(
          mapper,
          BookingDto,
          Booking,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.venue,
              mapFrom((src) => (src.venue ? this.mapper.map(src.venue, VenueDto, Venue) : null))
          ),
          forMember(
              (dest) => dest.userId,
              mapFrom((src) => src.userId)
          ),
          forMember(
              (dest) => dest.user,
              mapFrom((src) => (src.user ? this.mapper.map(src.user, UserDto, User) : null))
          ),
          forMember(
              (dest) => dest.startDate,
              mapFrom((src) => src.startDate)
          ),
          forMember(
              (dest) => dest.endDate,
              mapFrom((src) => src.endDate)
          ),
          forMember(
              (dest) => dest.startTime,
              mapFrom((src) => src.startTime)
          ),
          forMember(
              (dest) => dest.endTime,
              mapFrom((src) => src.endTime)
          ),
          forMember(
              (dest) => dest.totalAmount,
              mapFrom((src) => src.totalAmount)
          ),
          forMember(
              (dest) => dest.status,
              mapFrom((src) => src.status)
          ),
          forMember(
              (dest) => dest.specialRequests,
              mapFrom((src) => src.specialRequests)
          ),
          forMember(
              (dest) => dest.numberOfGuests,
              mapFrom((src) => src.numberOfGuests)
          ),
          forMember(
              (dest) => dest.serviceOptions,
              mapFrom((src) => this.mapper.mapArray(src.serviceOptions || [], ServiceOptionDto, ServiceOption))
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
          ),
          forMember(
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          )
      );
    };
  }
}