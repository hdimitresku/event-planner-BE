import { AutoMap } from '@automapper/classes';
import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import {MediaEntityType, MediaType} from "@/media/entities/media.entity";

export class MediaItemDto {

  @AutoMap()
  @IsString()
  url: string;

  @AutoMap()
  @IsEnum(MediaType)
  type: MediaType;
}