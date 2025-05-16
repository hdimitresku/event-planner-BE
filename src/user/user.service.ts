import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async findByEmail(email: string, includePassword = false): Promise<User | UserDto | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return undefined;
    return includePassword ? user : this.mapper.map(user, User, UserDto);
  }

  async create(data: Partial<User>, includePassword = false): Promise<User | UserDto> {
    const user = this.userRepository.create(data);
    const savedUser = await this.userRepository.save(user);
    return includePassword ? savedUser : this.mapper.map(savedUser, User, UserDto);
  }
} 