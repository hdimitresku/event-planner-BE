import { IsEnum, IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';
import { MediaType, MediaEntityType } from '../media.entity';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsEnum(MediaType)
  type: MediaType;

  @IsNotEmpty()
  @IsObject()
  description: { en: string; sq: string };

  @IsNotEmpty()
  @IsEnum(MediaEntityType)
  entityType: MediaEntityType;

  @IsNotEmpty()
  @IsUUID()
  entityId: string;
} 