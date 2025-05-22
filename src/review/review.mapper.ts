import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapWith } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ReviewDto } from '@/review/dto/review.dto';
import { UserDto } from '@/user/dto/user.dto';
import { VenueDto } from '@/venue/dto/venue.dto';
import {Review} from "@/review/review.entity";
import {User} from "@/user/entities/user.entity";
import {Venue} from "@/venue/entities/venue.entity";

@Injectable()
export class ReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      createMap(
          mapper,
          Review,
          ReviewDto,
          forMember(
              (dest) => dest.user,
              mapWith(UserDto, User, (source) => source.user),
          ),
          forMember(
              (dest) => dest.venue,
              mapWith(VenueDto, Venue, (source) => source.venue),
          ),
      );
    };
  }
}