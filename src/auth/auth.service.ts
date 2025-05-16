import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserDto } from '@/user/dto/user.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { User } from '@/user/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import * as process from "node:process";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthDto> {
    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({ ...registerDto, password: hashedPassword }, true);
    const userDto = this.mapper.map(user, User, UserDto);
    
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {secret: process.env.JWT_SECRET});
    const refreshToken = this.jwtService.sign(payload, {secret: process.env.JWT_SECRET ,expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: userDto,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email, true);
    if (!user || !('password' in user)) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const userDto = this.mapper.map(user, User, UserDto);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {secret: process.env.JWT_SECRET});
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET ,expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: userDto,
    };
  }
} 