import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from '@automapper/core';
import { User } from '@/user/entities/user.entity';
import { UserDto } from '@/user/dto/user.dto';
import { Booking } from '@/booking/booking.entity';
import { BookingDto } from '@/booking/dto/booking.dto';
import { MediaItem } from '@/media/media.entity';
import { Review } from '@/review/review.entity';
import { ReviewDto } from '@/review/dto/review.dto';
import { VenueDto } from './dto/venue.dto';
import { Venue } from './entities/venue.entity';
import { MediaItemDto } from '@/media/dto/media.dto';

@Injectable()
export class VenueProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      // Venue to VenueDto
      createMap(
          mapper,
          Venue,
          VenueDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.owner,
              mapFrom((src) => (src.owner ? this.mapper.map(src.owner, User, UserDto) : null))
          ),
          forMember(
              (dest) => dest.name,
              mapFrom((src) => src.name || {})
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description || {})
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type || [])
          ),
          forMember(
              (dest) => dest.address,
              mapFrom((src) => src.address || {})
          ),
          forMember(
              (dest) => dest.capacity,
              mapFrom((src) => src.capacity || {})
          ),
          forMember(
              (dest) => dest.price,
              mapFrom((src) => src.price || {})
          ),
          forMember(
              (dest) => dest.amenities,
              mapFrom((src) => src.amenities || [])
          ),
          forMember(
              (dest) => dest.photos,
              mapFrom((src) => src.photos || [])
          ),
          forMember(
              (dest) => dest.dayAvailability,
              mapFrom((src) => src.dayAvailability || null)
          ),
          forMember(
              (dest) => dest.isActive,
              mapFrom((src) => src.isActive)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata || {})
          ),
          forMember(
              (dest) => dest.bookings,
              mapFrom((src) => this.mapper.mapArray(src.bookings || [], Booking, BookingDto))
          ),
          forMember(
              (dest) => dest.media,
              mapFrom((src) => this.mapper.mapArray(src.media || [], MediaItem, MediaItemDto))
          ),
          forMember(
              (dest) => dest.reviews,
              mapFrom((src) => this.mapper.mapArray(src.reviews || [], Review, ReviewDto))
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

      // VenueDto to Venue
      createMap(
          mapper,
          VenueDto,
          Venue,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.owner,
              mapFrom((src) => (src.owner ? this.mapper.map(src.owner, UserDto, User) : null))
          ),
          forMember(
              (dest) => dest.name,
              mapFrom((src) => src.name)
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
          ),
          forMember(
              (dest) => dest.address,
              mapFrom((src) => src.address)
          ),
          forMember(
              (dest) => dest.capacity,
              mapFrom((src) => src.capacity)
          ),
          forMember(
              (dest) => dest.price,
              mapFrom((src) => src.price)
          ),
          forMember(
              (dest) => dest.amenities,
              mapFrom((src) => src.amenities)
          ),
          forMember(
              (dest) => dest.photos,
              mapFrom((src) => src.photos)
          ),
          forMember(
              (dest) => dest.dayAvailability,
              mapFrom((src) => src.dayAvailability)
          ),
          forMember(
              (dest) => dest.isActive,
              mapFrom((src) => src.isActive)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
          ),
          forMember(
              (dest) => dest.bookings,
              mapFrom((src) => this.mapper.mapArray(src.bookings || [], BookingDto, Booking))
          ),
          forMember(
              (dest) => dest.media,
              mapFrom((src) => this.mapper.mapArray(src.media || [], MediaItemDto, MediaItem))
          ),
          forMember(
              (dest) => dest.reviews,
              mapFrom((src) => this.mapper.mapArray(src.reviews || [], ReviewDto, Review))
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