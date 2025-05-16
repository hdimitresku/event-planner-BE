import { IsUUID, IsNumber, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { PaymentMethod } from '../payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 