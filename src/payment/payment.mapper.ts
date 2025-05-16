import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap, forMember, mapFrom } from '@automapper/core';
import { User } from '@/user/entities/user.entity';
import { UserDto } from '@/user/dto/user.dto';
import { Booking } from '@/booking/booking.entity';
import { BookingDto } from '@/booking/dto/booking.dto';
import {Payment} from "@/payment/payment.entity";
import {PaymentDto} from "@/payment/dto/payment.dto";

@Injectable()
export class PaymentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      // Payment to PaymentDto
      createMap(
          mapper,
          Payment,
          PaymentDto,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.user,
              mapFrom((src) => (src.user ? this.mapper.map(src.user, User, UserDto) : null))
          ),
          forMember(
              (dest) => dest.booking,
              mapFrom((src) => (src.booking ? this.mapper.map(src.booking, Booking, BookingDto) : null))
          ),
          forMember(
              (dest) => dest.amount,
              mapFrom((src) => src.amount)
          ),
          forMember(
              (dest) => dest.currency,
              mapFrom((src) => src.currency)
          ),
          forMember(
              (dest) => dest.status,
              mapFrom((src) => src.status)
          ),
          forMember(
              (dest) => dest.paymentMethod,
              mapFrom((src) => src.paymentMethod)
          ),
          forMember(
              (dest) => dest.paymentDetails,
              mapFrom((src) => src.paymentDetails || null)
          ),
          forMember(
              (dest) => dest.failureReason,
              mapFrom((src) => src.failureReason || null)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata || {})
          ),
          forMember(
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          )
      );

      // PaymentDto to Payment
      createMap(
          mapper,
          PaymentDto,
          Payment,
          forMember(
              (dest) => dest.id,
              mapFrom((src) => src.id)
          ),
          forMember(
              (dest) => dest.user,
              mapFrom((src) => (src.user ? this.mapper.map(src.user, UserDto, User) : null))
          ),
          forMember(
              (dest) => dest.booking,
              mapFrom((src) => (src.booking ? this.mapper.map(src.booking, BookingDto, Booking) : null))
          ),
          forMember(
              (dest) => dest.amount,
              mapFrom((src) => src.amount)
          ),
          forMember(
              (dest) => dest.currency,
              mapFrom((src) => src.currency)
          ),
          forMember(
              (dest) => dest.status,
              mapFrom((src) => src.status)
          ),
          forMember(
              (dest) => dest.paymentMethod,
              mapFrom((src) => src.paymentMethod)
          ),
          forMember(
              (dest) => dest.paymentDetails,
              mapFrom((src) => src.paymentDetails)
          ),
          forMember(
              (dest) => dest.failureReason,
              mapFrom((src) => src.failureReason)
          ),
          forMember(
              (dest) => dest.metadata,
              mapFrom((src) => src.metadata)
          ),
          forMember(
              (dest) => dest.createdAt,
              mapFrom((src) => src.createdAt)
          ),
          forMember(
              (dest) => dest.updatedAt,
              mapFrom((src) => src.updatedAt)
          )
      );
    };
  }
}