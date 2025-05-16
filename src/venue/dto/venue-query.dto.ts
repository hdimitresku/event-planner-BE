import { IsString, IsNumber, IsOptional, IsArray, Min, Max, IsEnum, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '../../shared/enums/price-type.enum';
import { VenueType } from '@/shared/enums/venue-type.enum';

export class VenueQueryDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(VenueType)
  @IsOptional()
  type?: VenueType;

  @IsArray()
  @IsEnum(VenueType, { each: true })
  @IsOptional()
  venueTypes?: VenueType[];

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

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsArray()
  @IsEnum(PriceType, { each: true })
  @IsOptional()
  priceTypes?: PriceType[];

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  minCapacity?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  guests?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Type(() => Number)
  @IsLatitude()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @Type(() => Number)
  @IsLongitude()
  @IsOptional()
  lng?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  radius?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
} 