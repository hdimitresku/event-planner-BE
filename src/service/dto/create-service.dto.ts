import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '../../shared/enums/price-type.enum';
import {ServiceType} from "@/shared/enums/service-type.enum";
import { VenueType } from "@/shared/enums/venue-type.enum";
import {PriceDto} from "@/venue/dto/create-venue.dto";

export class CreateServiceOptionDto {
  @IsObject()
  name: { [key: string]: string };

  @IsObject()
  description?: { [key: string]: string };

  @IsObject()
  price: PriceDto;
}

export class CreateServiceDto {
  @IsObject()
  name: { [key: string]: string };

  @IsObject()
  description: { [key: string]: string };

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsArray()
  @IsEnum(VenueType, { each: true })
  venueTypes: VenueType[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOptionDto)
  options: CreateServiceOptionDto[];

  @IsObject()
  @IsOptional()
  dayAvailability?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  images?: Express.Multer.File[];
} 