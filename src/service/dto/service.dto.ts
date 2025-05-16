import { AutoMap } from '@automapper/classes';
import {
  IsUUID,
  IsObject,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDate,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@/shared/enums/service-type.enum';
import { VenueType } from '@/shared/enums/venue-type.enum';
import { UserDto } from '@/user/dto/user.dto';
import {ServiceOptionDto} from "@/service/dto/service-option-dto";
import {MediaItemDto} from "@/media/dto/media.dto"; // Assuming UserDto exists

export class ServiceDto {
  @AutoMap()
  @IsUUID()
  id: string;

  @AutoMap()
  @ValidateNested()
  @Type(() => UserDto)
  provider: UserDto;

  @AutoMap()
  @IsArray()
  @IsEnum(VenueType, { each: true })
  venueTypes: VenueType[];

  @AutoMap()
  @IsObject()
  name: { [key: string]: string };

  @AutoMap()
  @IsObject()
  description: { [key: string]: string };

  @AutoMap()
  @IsEnum(ServiceType)
  type: ServiceType;

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
  @IsDate()
  createdAt: Date;

  @AutoMap()
  @IsDate()
  updatedAt: Date;

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => ServiceOptionDto)
  @IsArray()
  options: ServiceOptionDto[];

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  @IsArray()
  media: MediaItemDto[];
}