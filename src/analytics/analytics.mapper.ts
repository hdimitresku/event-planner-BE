import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AnalyticsLog } from './analytics-log.entity';
import { AnalyticsLogDto } from './dto/analytics-log.dto';
import { CreateAnalyticsLogDto } from './dto/create-analytics-log.dto';

@Injectable()
export class AnalyticsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, AnalyticsLog, AnalyticsLogDto);
      createMap(mapper, CreateAnalyticsLogDto, AnalyticsLog);
    };
  }
} 