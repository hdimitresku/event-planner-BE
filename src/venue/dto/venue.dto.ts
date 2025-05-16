import { AutoMap } from '@automapper/classes';
import {
  IsUUID,
  ValidateNested,
  IsObject,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VenueType } from '@/shared/enums/venue-type.enum';
import { VenueAddressInterface } from '@/shared/interfaces/venue-address.interface';
import { VenueCapacityInterface } from '@/shared/interfaces/venue-capacity.interface';
import { PriceInterface } from '@/shared/interfaces/price.interface';
import { UserDto } from '@/user/dto/user.dto';
import { BookingDto } from '@/booking/dto/booking.dto';
import { ReviewDto } from '@/review/dto/review.dto';
import {MediaItemDto} from "@/media/dto/media.dto";

export class VenueDto {
  @AutoMap()
  @IsUUID()
  id: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => UserDto)
  owner: UserDto;

  @AutoMap()
  @IsObject()
  name: { [key: string]: string };

  @AutoMap()
  @IsObject()
  description: { [key: string]: string };

  @AutoMap()
  @IsEnum(VenueType)
  type: VenueType;

  @AutoMap()
  @IsObject()
  address: VenueAddressInterface;

  @AutoMap()
  @IsObject()
  capacity: VenueCapacityInterface;

  @AutoMap()
  @IsObject()
  price: PriceInterface;

  @AutoMap()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities: string[];

  @AutoMap()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos: string[];

  @AutoMap()
  @IsObject()
  @IsOptional()
  dayAvailability: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  @AutoMap()
  @IsBoolean()
  isActive: boolean;

  @AutoMap()
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => BookingDto)
  @IsArray()
  bookings: BookingDto[];

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  @IsArray()
  media: MediaItemDto[];

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => ReviewDto)
  @IsArray()
  reviews: ReviewDto[];

  @AutoMap()
  @IsDate()
  createdAt: Date;

  @AutoMap()
  @IsDate()
  updatedAt: Date;
}