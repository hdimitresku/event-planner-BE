import {Injectable, Logger, BadRequestException, Inject, forwardRef} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import {InjectMapper} from '@automapper/nestjs';
import {Mapper} from '@automapper/core';
import {MediaEntityType, MediaItem, MediaType} from "@/media/entities/media.entity";
import {MediaItemDto} from "@/media/dto/media.dto";
import {Venue} from "@/venue/entities/venue.entity";
import {Service} from "@/service/entities/service.entity";
import {ServiceService} from "@/service/service.service";
import {VenueService} from "@/venue/venue.service";
import {ServiceDto} from "@/service/dto/service.dto";
import {VenueDto} from "@/venue/dto/venue.dto";

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

    constructor(
        @InjectRepository(MediaItem)
        private mediaRepository: Repository<MediaItem>,
        @Inject(forwardRef(() => ServiceService))
        private readonly serviceService: ServiceService,
        @Inject(forwardRef(() => VenueService))
        private readonly venueService: VenueService,
        @Inject(forwardRef(() => ConfigService))
        private readonly configService: ConfigService,
        @InjectMapper() private readonly mapper: Mapper,
    ) {
    }

    async processAndSaveImage(
        file: Express.Multer.File,
        userId: string,
        entityId?: string,
        entityType: MediaEntityType = MediaEntityType.VENUE,
    ): Promise<MediaItemDto> {
        // Validate file
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
            );
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        const uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';

        // Ensure upload directory exists
        try {
            await fs.mkdir(uploadDir, {recursive: true});
        } catch (error) {
            this.logger.error(`Error creating upload directory: ${error.message}`);
            throw new BadRequestException('Failed to create upload directory');
        }

        const processedFilename = `processed-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const processedPath = path.join(uploadDir, processedFilename);

        try {
            // Process image with sharp directly from buffer
            const image = sharp(file.buffer);
            const metadata = await image.metadata();

            if (!metadata.width || !metadata.height) {
                throw new BadRequestException('Invalid image file');
            }

            // Process and save image
            await image
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({quality: 80})
                .toFile(processedPath);

            // Create media record
            let venue: Venue | null = null;
            let service: Service = null;
            if (entityType === MediaEntityType.VENUE) {
                venue = await this.venueService.findOneEntity(entityId);
                if (!venue) {
                    throw new Error(`Venue with ID ${entityId} not found`);
                }
            } else if (entityType === MediaEntityType.SERVICE) {
                service = await this.serviceService.findOneEntity(entityId);
                if (!service) {
                    throw new Error(`Service with ID ${entityId} not found`);
                }
            }

            // Create media record
            const media = this.mediaRepository.create({
                url: processedPath,
                type: MediaType.IMAGE,
                description: {
                    en: file.originalname,
                    sq: file.originalname,
                },
                entityType,
                entityId,
                venue: entityType === MediaEntityType.VENUE ? venue : undefined,
                service: entityType === MediaEntityType.SERVICE ? service : undefined,
            });


            const savedMedia = await this.mediaRepository.save(media);
            return this.mapper.map(savedMedia, MediaItem, MediaItemDto);
        } catch (error) {
            this.logger.error(`Error processing image: ${error.message}`);

            // Clean up processed file if it exists
            try {
                if (processedPath) await fs.unlink(processedPath);
            } catch (cleanupError) {
                this.logger.error(`Error cleaning up files: ${cleanupError.message}`);
            }

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Failed to process image file');
        }
    }

    async getMediaById(id: string): Promise<MediaItemDto> {
        const media = await this.mediaRepository.findOne({
            where: {id},
        });
        return this.mapper.map(media, MediaItem, MediaItemDto);
    }

    async getVenueMedia(venueId: string): Promise<MediaItemDto[]> {
        const media = await this.mediaRepository.find({
            where: {entityId: venueId, entityType: MediaEntityType.VENUE},
            order: {createdAt: 'DESC'},
        });
        return this.mapper.mapArray(media, MediaItem, MediaItemDto);
    }

    async getServiceMedia(serviceId: string): Promise<MediaItemDto[]> {
        const media = await this.mediaRepository.find({
            where: {entityId: serviceId, entityType: MediaEntityType.SERVICE},
            order: {createdAt: 'DESC'},
        });
        return this.mapper.mapArray(media, MediaItem, MediaItemDto);
    }

    async getUserMedia(userId: string): Promise<MediaItemDto[]> {
        const media = await this.mediaRepository.find({
            where: {entityId: userId},
            order: {createdAt: 'DESC'},
        });
        return this.mapper.mapArray(media, MediaItem, MediaItemDto);
    }

    async deleteMedia(id: string): Promise<void> {
        const media = await this.mediaRepository.findOne({
            where: {id},
        });

        if (!media) {
            throw new Error('Media not found');
        }

        try {
            await fs.unlink(media.url);
            await this.mediaRepository.remove(media);
        } catch (error) {
            this.logger.error(`Error deleting media: ${error.message}`);
            throw error;
        }
    }
} 