import { UserDto } from '@/user/dto/user.dto';

export class ExternalReviewDto {
  id: string;
  venueId: string;
  externalId: string;
  externalSource: string;
  externalUrl: string;
  rating: number;
  comment: string;
  authorName: string;
  authorPhoto?: string;
  externalCreatedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ExternalReviewDto>) {
    Object.assign(this, partial);
  }
} 