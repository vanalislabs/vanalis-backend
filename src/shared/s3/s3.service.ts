import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { ConfigService } from '../config/config.service';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.s3.region,
      endpoint: this.config.s3.endpoint,
      credentials: {
        accessKeyId: this.config.s3.accessKeyId,
        secretAccessKey: this.config.s3.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile({
    key,
    body,
    contentType,
    contentLength,
    acl = 'public-read',
  }: {
    key: string;
    body: Buffer | Readable | string;
    contentType: string;
    contentLength: number;
    acl?: ObjectCannedACL;
  }): Promise<string> {
    const input: PutObjectCommandInput = {
      Bucket: this.config.s3.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: contentLength,
      ACL: acl,
    };

    await this.s3.send(new PutObjectCommand(input));

    return this.getS3PublicUrl(key);
  }

  getS3PublicUrl(key: string): string {
    return `${this.config.s3.endpoint}/${this.config.s3.bucketName}/${key}`;
  }

  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.s3.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3 as any, command, { expiresIn });
  }

  async getObjectStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.config.s3.bucketName,
      Key: key,
    });

    const response = await this.s3.send(command);
    const bodyStream = response.Body as Readable | undefined;

    if (!bodyStream) {
      throw new Error(`S3 object stream is empty for key: ${key}`);
    }

    return bodyStream;
  }

  async deleteFile(key: string): Promise<void> {
    const input: DeleteObjectCommandInput = {
      Bucket: this.config.s3.bucketName,
      Key: key,
    };

    await this.s3.send(new DeleteObjectCommand(input));
  }
}
