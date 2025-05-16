import { AutoMap } from '@automapper/classes';
import { IsUUID, IsObject, IsDate, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceInterface } from '@/shared/interfaces/price.interface';
import { ServiceDto } from './service.dto'; // Assuming a ServiceDto exists

export class ServiceOptionDto {
    @AutoMap()
    @IsUUID()
    id: string;

    @AutoMap()
    @IsObject()
    name: { [key: string]: string };

    @AutoMap()
    @IsObject()
    description: { [key: string]: string };

    @AutoMap()
    @IsObject()
    price: PriceInterface;

    @AutoMap()
    @IsObject()
    @IsOptional()
    metadata: Record<string, any>;

    @AutoMap()
    @ValidateNested()
    @Type(() => ServiceDto)
    service: ServiceDto;

    @AutoMap()
    @IsDate()
    createdAt: Date;

    @AutoMap()
    @IsDate()
    updatedAt: Date;
}