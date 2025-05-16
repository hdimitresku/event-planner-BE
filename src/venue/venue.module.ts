import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { VenueProfile } from './venue.mapper';
import {ServiceModule} from "@/service/service.module";
import {MediaModule} from "@/media/media.module";
import {AutomapperModule} from "@automapper/nestjs";

@Module({
  imports: [TypeOrmModule.forFeature([Venue]), ServiceModule, MediaModule, AutomapperModule],
  providers: [VenueService, VenueProfile],
  controllers: [VenueController],
  exports: [VenueService],
})
export class VenueModule {} 