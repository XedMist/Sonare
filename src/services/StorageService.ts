import * as Minio from 'minio';
import { config } from '@/config.ts';

export class StorageService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
    this.bucketName = config.minio.bucketName;
  }

  async initialize() {
      try {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            // Note: makeBucket might fail if the user doesn't have permissions to create buckets
            // or if the region is required.
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            console.log(`Bucket ${this.bucketName} created successfully.`);
        }
      } catch (err) {
          console.error("Error checking/creating bucket:", err);
          // Don't throw here, maybe the bucket exists but we don't have ListBucket permission
      }
  }

  async uploadFile(objectName: string, filePath: string, metaData?: Record<string, string>) {
    return this.minioClient.fPutObject(this.bucketName, objectName, filePath, metaData);
  }

  async getPresignedUrl(objectName: string, expiryInSeconds: number = 3600): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiryInSeconds);
  }
  
  async deleteFile(objectName: string) {
      return await this.minioClient.removeObject(this.bucketName, objectName);
  }
}
