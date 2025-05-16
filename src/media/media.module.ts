import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MediaItem} from './media.entity';
import {MediaService} from './media.service';
import {MediaController} from './media.controller';
import {MulterModule} from '@nestjs/platform-express';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {MediaItemProfile} from "@/media/media.mapper";

@Module({
    imports: [
        TypeOrmModule.forFeature([MediaItem]),
        ConfigModule,
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
    providers: [MediaService, MediaItemProfile],
    controllers: [MediaController],
    exports: [MediaService],
})
export class MediaModule {
}