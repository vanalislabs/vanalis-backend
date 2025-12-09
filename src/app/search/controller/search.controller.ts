import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Query, UseInterceptors } from "@nestjs/common";
import { SearchService } from "../service/search.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { GlobalSearchQueryDto } from "../dto/global-search-query.dto";

@ApiTags('Search')
@UseInterceptors(TransformInterceptor)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved search results!",
  })
  @ResponseMessage("Successfully retrieved search results!")
  @Get()
  async globalSearch(
    @Query() query: GlobalSearchQueryDto
  ) {
    return this.searchService.globalSearch(query);
  }
}