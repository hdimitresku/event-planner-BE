import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {UpdateUserDto} from "@/user/dto/update-user.dto";
import {ChangePasswordDto} from "@/user/dto/change-password.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async getLoggedInUser(userId: string): Promise<User | UserDto | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return undefined;
    return this.mapper.map(user, User, UserDto);
  }

  async findById(userId: string): Promise<User | UserDto | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return undefined;
    return this.mapper.map(user, User, UserDto);
  }

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

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update fields
    Object.assign(user, updateUserDto);

    // Save the updated user
    const updatedUser = await this.userRepository.save(user);

    // Map to DTO and return
    return this.mapper.map(updatedUser, User, UserDto);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user
    await this.userRepository.save(user);
  }
} 