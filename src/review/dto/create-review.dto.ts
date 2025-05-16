import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  venueId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
} 