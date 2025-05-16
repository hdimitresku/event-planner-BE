import { IsString, IsNumber, IsOptional, IsArray, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '../../shared/enums/price-type.enum';
import {ServiceType} from "@/shared/enums/service-type.enum";
import { VenueType } from "@/shared/enums/venue-type.enum";

export class ServiceQueryDto {
  @IsString()
  @IsOptional()
  type?: ServiceType;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsArray()
  @IsEnum(VenueType, { each: true })
  @IsOptional()
  venueTypes?: VenueType[];
} 