import { AutoMap } from '@automapper/classes';
import { IsString, IsInt, Min, Max, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { UserDto } from '@/user/dto/user.dto';
import { VenueDto } from '@/venue/dto/venue.dto';

export class ReviewDto {
  @AutoMap()
  @IsString()
  id: string;

  @AutoMap(() => UserDto)
  user: UserDto;

  @AutoMap(() => VenueDto)
  venue: VenueDto;

  @AutoMap()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @AutoMap()
  @IsString()
  comment: string;

  @AutoMap()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @AutoMap()
  @IsBoolean()
  isVerified: boolean;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}