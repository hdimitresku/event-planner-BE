import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, MappingProfile, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import {MediaItemDto} from "@/media/dto/media.dto";
import {MediaItem} from "@/media/entities/media.entity";

@Injectable()
export class MediaItemProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile(): MappingProfile {
        return (mapper) => {
            createMap(mapper, MediaItem, MediaItemDto);
        };
    }
}