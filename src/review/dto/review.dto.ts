import { Exclude, Expose } from 'class-transformer';
import { UserDto } from '../../user/dto/user.dto';
import { Venue } from '../../venue/entities/venue.entity';

@Exclude()
export class ReviewDto {
  @Expose()
  id: string;

  @Expose()
  user: UserDto;

  @Expose()
  venue: Venue;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  photos: string[];

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ReviewDto>) {
    Object.assign(this, partial);
  }
} 