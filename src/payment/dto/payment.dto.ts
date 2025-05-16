import { AutoMap } from '@automapper/classes';
import {
  IsUUID,
  ValidateNested,
  IsNumber,
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsDate,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '@/user/dto/user.dto'; // Assuming UserDto exists
import { BookingDto } from '@/booking/dto/booking.dto';
import {PaymentStatus} from "@/booking/booking.entity";
import {PaymentMethod} from "@/payment/payment.entity"; // Assuming BookingDto exists

export class PaymentDto {
  @AutoMap()
  @IsUUID()
  id: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @AutoMap()
  @ValidateNested()
  @Type(() => BookingDto)
  booking: BookingDto;

  @AutoMap()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @AutoMap()
  @IsString()
  @Length(3, 3)
  currency: string;

  @AutoMap()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @AutoMap()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @AutoMap()
  @IsObject()
  @IsOptional()
  paymentDetails: {
    transactionId?: string;
    cardLast4?: string;
    cardBrand?: string;
    bankName?: string;
    accountNumber?: string;
  };

  @AutoMap()
  @IsString()
  @IsOptional()
  failureReason: string;

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
}