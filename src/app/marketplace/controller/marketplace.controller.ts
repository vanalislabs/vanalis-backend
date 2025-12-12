import { Controller, Get, Query, Param, HttpStatus, UseInterceptors, HttpCode, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";
import { BrowseMarketplaceQueryDto } from "../dto/browse-marketplace-query.dto";
import { MarketplaceService } from "../service/marketplace.service";

@ApiTags('Marketplace')
@UseInterceptors(TransformInterceptor)
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
  ) { }

  @Get('browse')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully browsed marketplace listings!",
  })
  @ResponseMessage("Successfully browsed marketplace listings!")
  async browseListings(
    @Query() query: BrowseMarketplaceQueryDto,
  ) {
    return this.marketplaceService.browseListings(query);
  }

  @Get('listing/:id')
  @ApiOkResponse({
    description: "Successfully retrieved listing details!",
  })
  @ResponseMessage("Successfully retrieved listing details!")
  async getListingById(@Param('id') id: string) {
    return this.marketplaceService.getListingById(id);
  }

  @Get('listing/:id/sales')
  @ApiOkResponse({
    description: "Successfully retrieved listing sales!",
  })
  @ResponseMessage("Successfully retrieved listing sales!")
  async getListingSales(@Param('id') id: string) {
    return this.marketplaceService.getListingSales(id);
  }

  @Get('project/:projectId/stats')
  @ApiOkResponse({
    description: "Successfully retrieved marketplace stats!",
  })
  @ResponseMessage("Successfully retrieved marketplace stats!")
  async getMarketplaceStats(@Param('projectId') projectId: string) {
    return this.marketplaceService.getMarketplaceStats(projectId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my-listings')
  @ApiOkResponse({
    description: "Successfully retrieved my listings!",
  })
  @ResponseMessage("Successfully retrieved my listings!")
  async getMyListings(@GetUser() user: User) {
    return this.marketplaceService.getMyListings(user.address);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('purchased-datasets')
  @ApiOkResponse({
    description: "Successfully retrieved purchased datasets!",
  })
  @ResponseMessage("Successfully retrieved purchased datasets!")
  async getPurchasedDatasets(@GetUser() user: User) {
    return this.marketplaceService.getPurchasedDatasets(user.address);
  }
}
