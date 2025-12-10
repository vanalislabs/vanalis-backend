import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { StorageService } from "../service/storage.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { RetrieveUrlQueryDto } from "../dto/retrieve-url-query.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";

@ApiTags('Storage')
@UseInterceptors(TransformInterceptor)
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved base URL!",
  })
  @ResponseMessage("Successfully retrieved base URL!")
  @Get('base-url')
  async getBaseUrl() {
    return this.storageService.getBaseUrl();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved url!",
  })
  @ResponseMessage("Successfully retrieved url!")
  @Get('retrieve-url')
  async retrieveUrl(
    @Query() query: RetrieveUrlQueryDto,
  ) {
    return this.storageService.retrieveUrl(query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully zipped project submissions!",
  })
  @ResponseMessage("Successfully zipped project submissions!")
  @Get('retrieve-zip-project-submission/:projectId')
  async retrieveZipProjectSubmission(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    return this.storageService.retrieveZipProjectSubmission(projectId, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully zipped project submissions!",
  })
  @ResponseMessage("Successfully zipped project submissions!")
  @Post('zip-project-submission/:projectId')
  async zipProjectSubmissions(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    return this.storageService.zipProjectSubmissions(projectId, user);
  }
}