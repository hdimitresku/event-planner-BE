import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../media/media.service';
import {MediaEntityType} from "@/media/media.entity";

@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST)
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body('data') data: string,
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: false,
      }),
    ) files: Express.Multer.File[],
  ) {
    const createServiceDto: CreateServiceDto = JSON.parse(data);
    const service = await this.serviceService.create(createServiceDto, req.user);

    // Process and save images if any
    if (files?.length) {
      for (const file of files) {
        await this.mediaService.processAndSaveImage(
          file,
          req.user.userId,
          service.id,
          MediaEntityType.SERVICE,
        );
      }
    }

    return service;
  }

  @Get()
  findAll(@Query() query: ServiceQueryDto) {
    return this.serviceService.findAll(query);
  }

  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.serviceService.findByType(type);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.serviceService.findByVenue(venueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST)
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body('data') data: string,
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: false,
      }),
    ) files: Express.Multer.File[],
  ) {
    const updateServiceDto: UpdateServiceDto = JSON.parse(data);
    const service = await this.serviceService.update(id, updateServiceDto, req.user);

    // Process and save new images if any
    if (files?.length) {
      for (const file of files) {
        await this.mediaService.processAndSaveImage(
          file,
          req.user.userId,
          service.id,
          MediaEntityType.SERVICE,
        );
      }
    }

    return service;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST)
  remove(@Param('id') id: string, @Request() req) {
    return this.serviceService.remove(id, req.user);
  }
} 