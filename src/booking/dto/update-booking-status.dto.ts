import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
} 