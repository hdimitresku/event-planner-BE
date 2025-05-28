import { AutoMap } from '@automapper/classes';
import {
  IsUUID,
  ValidateNested,
  IsDate,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsInt, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '@/user/dto/user.dto';
import { VenueDto } from '@/venue/dto/venue.dto';
import {ServiceOptionDto} from "@/service/dto/service-option-dto";
import {BookingStatus, EventType} from "@/booking/entities/booking.entity";

export class BookingDto {
  @AutoMap()
  @IsUUID()
  id: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => VenueDto)
  venue: VenueDto;

  @AutoMap()
  @IsUUID()
  userId: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @AutoMap()
  @IsDate()
  startDate: Date;

  @AutoMap()
  @IsDate()
  endDate: Date;

  @AutoMap()
  @IsString()
  startTime: string;

  @AutoMap()
  @IsString()
  endTime: string;

  @AutoMap()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalAmount: number;

  @AutoMap()
  @IsNumber({ maxDecimalPlaces: 2 })
  serviceFeePercentage: number;

  @AutoMap()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsEnum(EventType)
  @AutoMap()
  eventType: EventType;

  @AutoMap()
  @IsString()
  @IsOptional()
  specialRequests: string;

  @AutoMap()
  @IsInt()
  numberOfGuests: number;

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => ServiceOptionDto)
  @IsArray()
  serviceOptions: ServiceOptionDto[];

  @AutoMap()
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;

  @AutoMap()
  @IsDate()
  createdAt: Date;

  @AutoMap()
  @IsDate()
  updatedAt: Date;

  @IsNumber()
  serviceFee?: number;
}