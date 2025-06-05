import {Body, Controller, Get, Param, Patch, Req, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {UserService} from "@/user/user.service";
import {GetUser} from "@/auth/decorators/get-user.decorator";
import {UpdateUserDto} from "@/user/dto/update-user.dto";
import {UserDto} from "@/user/dto/user.dto";
import {ChangePasswordDto} from "@/user/dto/change-password.dto";
import {RolesGuard} from "@/auth/guards/roles.guard";
import {Roles} from "@/auth/decorators/roles.decorator";
import {UserRole} from "@/user/entities/user.entity";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@GetUser('id') userId: string): Promise<UserDto> {
        return this.userService.getLoggedInUser(userId);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard) // Protect endpoint with JWT authentication
    async updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @GetUser('id') userId: string,
    ): Promise<UserDto> {
        return this.userService.update(userId, updateUserDto);
    }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @GetUser('id') userId: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        await this.userService.changePassword(userId, changePasswordDto);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUserById(@Param('id') id: string): Promise<UserDto> {
        return await this.userService.findById(id);
    }
} 