import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Query, UseInterceptors } from "@nestjs/common";
import { StorageService } from "../service/storage.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { RetrieveUrlQueryDto } from "../dto/retrieve-url-query.dto";

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
}