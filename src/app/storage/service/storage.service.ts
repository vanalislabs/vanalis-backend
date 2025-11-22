import { Injectable } from "@nestjs/common";
import { S3Service } from "src/shared/s3/s3.service";
import { RetrieveUrlQueryDto } from "../dto/retrieve-url-query.dto";

@Injectable()
export class StorageService {
  constructor(
    private readonly s3Service: S3Service,
  ) { }

  async getBaseUrl() {
    return this.s3Service.getS3PublicUrl('');
  }

  async retrieveUrl(query: RetrieveUrlQueryDto) {
    return this.s3Service.getS3PublicUrl(query.filePathKey);
  }
}