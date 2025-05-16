import { IsString, IsDate, IsNumber, IsOptional, IsEnum, Min, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  @IsString()
  venueId: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  @Min(1)
  numberOfGuests: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  serviceOptionIds?: string[];

  @IsString()
  @IsOptional()
  specialRequests?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
} 