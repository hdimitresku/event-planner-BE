import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProfile } from './user.mapper';
import {AutomapperModule} from "@automapper/nestjs";

@Module({
  imports: [TypeOrmModule.forFeature([User]), AutomapperModule],
  providers: [UserService, UserProfile],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {} 