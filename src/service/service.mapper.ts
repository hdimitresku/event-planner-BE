import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from '@automapper/core';
import { Service } from './entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceOption } from './entities/service-option.entity';
import { ServiceOptionDto } from './dto/service-option-dto';
import { User } from '@/user/entities/user.entity';
import { UserDto } from '@/user/dto/user.dto';
import { MediaItem } from '@/media/entities/media.entity';
import { MediaItemDto } from '@/media/dto/media.dto';

@Injectable()
export class ServiceProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      // Service to ServiceDto
      createMap(
          mapper,
          Service,
          ServiceDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
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
              (dest) => dest.venueTypes,
              mapFrom((src) => src.venueTypes || [])
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
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
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          ),
          forMember(
              (dest) => dest.provider,
              mapFrom((src) => (src.provider ? this.mapper.map(src.provider, User, UserDto) : null))
          ),
          forMember(
              (dest) => dest.options,
              mapFrom((src) => this.mapper.mapArray(src.options || [], ServiceOption, ServiceOptionDto))
          ),
          forMember(
              (dest) => dest.media,
              mapFrom((src) => this.mapper.mapArray(src.media || [], MediaItem, MediaItemDto))
          )
      );

      // ServiceDto to Service
      createMap(
          mapper,
          ServiceDto,
          Service,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
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
              (dest) => dest.venueTypes,
              mapFrom((src) => src.venueTypes)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
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
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          ),
          forMember(
              (dest) => dest.provider,
              mapFrom((src) => (src.provider ? this.mapper.map(src.provider, UserDto, User) : null))
          ),
          forMember(
              (dest) => dest.options,
              mapFrom((src) => this.mapper.mapArray(src.options || [], ServiceOptionDto, ServiceOption))
          ),
          forMember(
              (dest) => dest.media,
              mapFrom((src) => this.mapper.mapArray(src.media || [], MediaItemDto, MediaItem))
          )
      );

      // CreateServiceDto to Service
      createMap(
          mapper,
          CreateServiceDto,
          Service,
          forMember(
              (dest) => dest.name,
              mapFrom((src) => src.name)
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description)
          ),
          forMember(
              (dest) => dest.venueTypes,
              mapFrom((src) => src.venueTypes)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
          ),
          forMember(
              (dest) => dest.dayAvailability,
              mapFrom((src) => src.dayAvailability)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
          ),
          forMember(
              (dest) => dest.options,
              mapFrom((src) => this.mapper.mapArray(src.options || [], ServiceOptionDto, ServiceOption))
          ),
      );

      // UpdateServiceDto to Service
      createMap(
          mapper,
          UpdateServiceDto,
          Service,
          forMember(
              (dest) => dest.name,
              mapFrom((src) => src.name)
          ),
          forMember(
              (dest) => dest.description,
              mapFrom((src) => src.description)
          ),
          forMember(
              (dest) => dest.venueTypes,
              mapFrom((src) => src.venueTypes)
          ),
          forMember(
              (dest) => dest.type,
              mapFrom((src) => src.type)
          ),
          forMember(
              (dest) => dest.dayAvailability,
              mapFrom((src) => src.dayAvailability)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
          ),
          forMember(
              (dest) => dest.options,
              mapFrom((src) => this.mapper.mapArray(src.options || [], ServiceOptionDto, ServiceOption))
          ),
      );

      // ServiceOption to ServiceOptionDto
      createMap(
          mapper,
          ServiceOption,
          ServiceOptionDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
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
              (dest) => dest.price,
              mapFrom((src) => src.price)
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

      // ServiceOptionDto to ServiceOption
      createMap(
          mapper,
          ServiceOptionDto,
          ServiceOption,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
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
              (dest) => dest.price,
              mapFrom((src) => src.price)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
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