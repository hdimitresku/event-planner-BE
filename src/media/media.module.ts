import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MediaItem} from './entities/media.entity';
import {MediaService} from './media.service';
import {MediaController} from './media.controller';
import {MulterModule} from '@nestjs/platform-express';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {MediaItemProfile} from "@/media/media.mapper";
import {ServiceModule} from "@/service/service.module";
import {VenueModule} from "@/venue/venue.module";
import {MinioService} from '../shared/minio.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MediaItem]),
        ConfigModule.forRoot(), // Initialize ConfigModule
        forwardRef(() => VenueModule), // Handle circular dependency
        forwardRef(() => ServiceModule),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                storage: diskStorage({
                    destination: configService.get('UPLOAD_DIR') || './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                        return callback(new Error('Only image files are allowed!'), false);
                    }
                    callback(null, true);
                },
                limits: {
                    fileSize: 5 * 1024 * 1024, // 5MB
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MediaService, MediaItemProfile, MinioService],
    controllers: [MediaController],
    exports: [MediaService],
})
export class MediaModule {
}