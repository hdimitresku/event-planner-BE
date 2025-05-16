import {AutoMap} from "@automapper/classes";
import {IsDate, IsObject, IsString} from "class-validator";

export class AnalyticsLogDto {
  @AutoMap()
  @IsString()
  id: string;

  @AutoMap()
  @IsString()
  userId: string;

  @AutoMap()
  @IsString()
  action: string;

  @AutoMap()
  @IsObject()
  details: any;

  @AutoMap()
  @IsDate()
  createdAt: Date;

  constructor(partial: Partial<AnalyticsLogDto>) {
    Object.assign(this, partial);
  }
} 