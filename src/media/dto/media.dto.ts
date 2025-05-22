import { AutoMap } from '@automapper/classes';
import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import {MediaEntityType, MediaType} from "@/media/entities/media.entity";

export class MediaItemDto {
  @AutoMap()
  @IsString()
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
  @IsString()
  entityId: string;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}