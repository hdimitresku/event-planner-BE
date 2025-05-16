import { AutoMap } from '@automapper/classes';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsObject,
  IsDate,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VenueDto } from '@/venue/dto/venue.dto';
import { ServiceDto } from '@/service/dto/service.dto';
import {MediaEntityType, MediaType} from "@/media/media.entity";

export class MediaItemDto {
  @AutoMap()
  @IsUUID()
  id: string;

  @AutoMap()
  @IsString()
  url: string;

  @AutoMap()
  @IsEnum(MediaType)
  type: MediaType;

  @AutoMap()
  @IsObject()
  description: { en: string; sq: string };

  @AutoMap()
  @IsEnum(MediaEntityType)
  entityType: MediaEntityType;

  @AutoMap()
  @IsUUID()
  entityId: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => VenueDto)
  @IsOptional()
  venue: VenueDto;

  @AutoMap()
  @ValidateNested()
  @Type(() => ServiceDto)
  @IsOptional()
  service: ServiceDto;

  @AutoMap()
  @IsDate()
  createdAt: Date;

  @AutoMap()
  @IsDate()
  updatedAt: Date;
}