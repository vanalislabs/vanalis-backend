import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { User } from "prisma/generated/client";
import { PrismaService } from "src/shared/prisma/prisma.service";
import crypto from 'crypto';
import { S3Service } from "src/shared/s3/s3.service";


@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) { }

  async uploadFullDataset(file: any, user: User) {
    try {
      const filename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}-${file.filename.filename}`;
      const contentType = file.filename.mimeType;

      const originalBuffer = file.buffer;
      const originalSize = originalBuffer.length;
      let buffer = originalBuffer;
      let size = originalSize;

      const key = `full-dataset/${filename}`;

      const url = await this.s3Service.uploadFile({
        key,
        body: buffer,
        contentType,
        contentLength: buffer.length,
      });

      await this.prisma.mediaFile.create({
        data: {
          name: filename,
          mimeType: file.filename.mimeType,
          extension: file.filename.filename.split('.').pop(),
          filePathKey: key,
          size,
          uploader: user.address,
          publicUrl: url,
        }
      })

      return {
        filePathKey: key,
      };
    } catch (error) {
      this.logger.error(`Error on upload file to cloud: ${error}`);
      throw new HttpException(
        'Error on upload file to cloud',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}