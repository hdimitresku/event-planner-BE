import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('venueId') venueId?: string,
  ) {
    return this.mediaService.processAndSaveImage(file, user.id, venueId);
  }

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get all media for a venue' })
  @ApiResponse({ status: 200, description: 'Returns all media for the venue' })
  async getVenueMedia(@Param('venueId') venueId: string) {
    return this.mediaService.getVenueMedia(venueId);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all media for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all media for the user' })
  async getUserMedia(@GetUser() user: User) {
    return this.mediaService.getUserMedia(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
} 