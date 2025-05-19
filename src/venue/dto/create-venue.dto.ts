  import { IsString, IsNumber, IsArray, IsOptional, IsObject, Min, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '../../shared/enums/price-type.enum';
import { VenueType } from '@/shared/enums/venue-type.enum';
import { AddressInterface } from '../../shared/interfaces/address.interface';
import { VenueCapacityInterface } from '../../shared/interfaces/venue-capacity.interface';
import { PriceInterface } from '@/shared/interfaces/price.interface';

class AddressDto implements AddressInterface {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;

  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
  }
}

class CapacityDto implements VenueCapacityInterface {
  @IsNumber()
  @Min(1)
  min: number;

  @IsNumber()
  @Min(1)
  max: number;

  @IsNumber()
  @Min(1)
  recommended: number;
}

export class PriceDto implements PriceInterface {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PriceType)
  type: PriceType;
}

export class CreateVenueDto {
  @IsObject()
  name: { [key: string]: string };

  @IsObject()
  description: { [key: string]: string };

  @IsEnum(VenueType)
  type: VenueType;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => CapacityDto)
  capacity: CapacityDto;

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

  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsObject()
  @IsOptional()
  availability?: {
    startTime: string;
    endTime: string;
    days: string[];
  };

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  images?: Express.Multer.File[];
} 