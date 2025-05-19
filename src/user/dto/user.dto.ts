import { AutoMap } from '@automapper/classes';
import { VenueDto } from '@/venue/dto/venue.dto'; // Adjust path
import { ServiceDto } from '@/service/dto/service.dto'; // Adjust path
import { BookingDto } from '@/booking/dto/booking.dto'; // Adjust path
import { ReviewDto } from '@/review/dto/review.dto'; // Adjust path
import { MessageDto } from '@/message/dto/message.dto';
import {UserRole} from "@/user/entities/user.entity";
import {AddressInterface} from "@/shared/interfaces/address.interface";
import {IsObject} from "class-validator"; // Adjust path

export class UserDto {
  @AutoMap()
  id: string;

  @AutoMap()
  email: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  phoneNumber?: string;

  @AutoMap()
  birthday?: Date;

  @AutoMap()
  profilePicture?: string;

  @AutoMap()
  role: UserRole;

  @AutoMap()
  @IsObject()
  address?: AddressInterface;

  @AutoMap(() => [MessageDto])
  sentMessages?: MessageDto[];

  @AutoMap(() => [MessageDto])
  receivedMessages?: MessageDto[];

  @AutoMap(() => [VenueDto])
  venues?: VenueDto[];

  @AutoMap(() => [ServiceDto])
  services?: ServiceDto[];

  @AutoMap(() => [ReviewDto])
  reviews?: ReviewDto[];

  @AutoMap(() => [BookingDto])
  bookings?: BookingDto[];

  @AutoMap()
  metadata?: Record<string, any>;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}