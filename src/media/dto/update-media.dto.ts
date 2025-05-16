import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MediaType } from '../media.entity';

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsObject()
  description?: { en: string; sq: string };
} 