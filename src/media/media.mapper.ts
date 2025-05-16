import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from '@automapper/core';
import { Venue } from '@/venue/entities/venue.entity';
import { VenueDto } from '@/venue/dto/venue.dto';
import { Service } from '@/service/entities/service.entity';
import { ServiceDto } from '@/service/dto/service.dto';
import {MediaItem} from "@/media/media.entity";
import {MediaItemDto} from "@/media/dto/media.dto";

@Injectable()
export class MediaItemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      // MediaItem to MediaItemDto
      createMap(
          mapper,
          MediaItem,
          MediaItemDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.url,
              mapFrom((src) => src.url)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description || { en: '', sq: '' })
          ),
          forMember(
              (dest) => dest.entityType,
              mapFrom((src) => src.entityType)
          ),
          forMember(
              (dest) => dest.entityId,
              mapFrom((src) => src.entityId)
          ),
          forMember(
              (dest) => dest.venue,
              mapFrom((src) => (src.venue ? this.mapper.map(src.venue, Venue, VenueDto) : null))
          ),
          forMember(
              (dest) => dest.service,
              mapFrom((src) => (src.service ? this.mapper.map(src.service, Service, ServiceDto) : null))
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

      // MediaItemDto to MediaItem
      createMap(
          mapper,
          MediaItemDto,
          MediaItem,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.url,
              mapFrom((src) => src.url)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description)
          ),
          forMember(
              (dest) => dest.entityType,
              mapFrom((src) => src.entityType)
          ),
          forMember(
              (dest) => dest.entityId,
              mapFrom((src) => src.entityId)
          ),
          forMember(
              (dest) => dest.venue,
              mapFrom((src) => (src.venue ? this.mapper.map(src.venue, VenueDto, Venue) : null))
          ),
          forMember(
              (dest) => dest.service,
              mapFrom((src) => (src.service ? this.mapper.map(src.service, ServiceDto, Service) : null))
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