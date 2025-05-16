import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';
import { MessageDto } from './dto/message.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, Message, MessageDto);
      createMap(mapper, CreateMessageDto, Message);
    };
  }
} 