import { Controller, HttpCode, HttpException, HttpStatus, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { UploadService } from "../service/upload.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { UploadFileDto } from "../dto/upload-file.dto";
import { Request } from "express";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";
import { parseMultipartForm } from "src/utils/busboy-parser";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Upload')
@UseInterceptors(TransformInterceptor)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an full dataset',
    type: UploadFileDto,
  })
  @ApiOkResponse({
    description: 'Successfully uploaded full dataset!',
    schema: {
      type: 'object',
      properties: {
        filePathKey: { type: 'string' },
      },
    },
  })
  @ResponseMessage("Successfully uploaded full dataset!")
  @Post('full-dataset')
  async uploadFullDataset(
    @Req() req: Request,
    @GetUser() user: User
  ): Promise<{
    filePathKey: string;
  }> {
    if (!req.headers['content-type']?.startsWith('multipart/form-data')) {
      throw new HttpException('Invalid content-type', HttpStatus.BAD_REQUEST);
    }

    const { files } = await parseMultipartForm(req, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      }
    });
    if (!files.length) {
      throw new Error('No file uploaded');
    }

    return this.uploadService.uploadFullDataset(files[0], user);
  }
}