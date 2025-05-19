import { AutoMap } from '@automapper/classes';
import {IsString, IsOptional, IsEnum, IsDateString, ValidateNested, IsDate} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressInterface } from '@/shared/interfaces/address.interface';
import {UserRole} from "@/user/entities/user.entity";

export class UpdateUserDto {
    @AutoMap()
    @IsString()
    @IsOptional()
    firstName?: string;

    @AutoMap()
    @IsString()
    @IsOptional()
    lastName?: string;

    @AutoMap()
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @AutoMap()
    @IsDate()
    @IsOptional()
    birthday?: Date;

    @AutoMap()
    @IsString()
    @IsOptional()
    profilePicture?: string;

    @AutoMap()
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @AutoMap()
    @ValidateNested()
    @Type(() => Object)
    @IsOptional()
    address?: AddressInterface;

    @AutoMap()
    @IsOptional()
    metadata?: Record<string, any>;
}