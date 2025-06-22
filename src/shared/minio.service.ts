import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async uploadFile(bucket: string, objectName: string, buffer: Buffer, metaData: any = {}): Promise<string> {
    await this.ensureBucketExists(bucket);
    await this.minioClient.putObject(bucket, objectName, buffer, metaData);
    return objectName;
  }

  async getFileStream(bucket: string, objectName: string) {
    return this.minioClient.getObject(bucket, objectName);
  }

  async ensureBucketExists(bucket: string) {
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket, 'us-east-1');
    }
  }
} 