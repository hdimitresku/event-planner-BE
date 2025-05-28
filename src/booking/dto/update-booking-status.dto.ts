import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
} 