import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnalyticsLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  details?: any;
} 