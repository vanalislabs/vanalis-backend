import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { PrismaService } from './prisma/prisma.service';
import { S3Service } from './s3/s3.service';

const providers = [ConfigService, PrismaService, S3Service];

@Global()
@Module({
  providers,
  exports: [...providers],
})
export class SharedModule { }
