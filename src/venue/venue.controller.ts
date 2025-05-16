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
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueQueryDto } from './dto/venue-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../media/media.service';
import {MediaEntityType} from "@/media/media.entity";

@Controller('venues')
export class VenueController {
  constructor(
    private readonly venueService: VenueService,
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
    const createVenueDto: CreateVenueDto = JSON.parse(data);
    const venue = await this.venueService.create(createVenueDto, req.user);

    // Process and save images if any
    if (files?.length) {
      for (const file of files) {
        await this.mediaService.processAndSaveImage(
          file,
          req.user.userId,
          venue.id,
          MediaEntityType.VENUE,
        );
      }
    }

    return venue;
  }

  @Get()
  findAll(@Query() query: VenueQueryDto) {
    return this.venueService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venueService.findOne(id);
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
    const updateVenueDto: UpdateVenueDto = JSON.parse(data);
    const venue = await this.venueService.update(id, updateVenueDto, req.user);

    // Process and save new images if any
    if (files?.length) {
      for (const file of files) {
        await this.mediaService.processAndSaveImage(
          file,
          req.user.userId,
          venue.id,
          MediaEntityType.VENUE,
        );
      }
    }

    return venue;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST)
  remove(@Param('id') id: string, @Request() req) {
    return this.venueService.remove(id, req.user);
  }
} 