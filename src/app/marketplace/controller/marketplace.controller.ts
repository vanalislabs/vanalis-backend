import { Controller, Get, Query, Param, HttpStatus, UseInterceptors, HttpCode, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { MarketplaceRepository } from "src/repositories/marketplace.repository";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";
import { ProjectService } from "src/app/project/service/project.service";
import { BrowseMarketplaceQueryDto } from "../dto/browse-marketplace-query.dto";

@ApiTags('Marketplace')
@UseInterceptors(TransformInterceptor)
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
    private readonly projectService: ProjectService,
  ) {}

  @Get('browse')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully browsed marketplace listings!",
  })
  @ResponseMessage("Successfully browsed marketplace listings!")
  async browseListings(
    @Query() query: BrowseMarketplaceQueryDto,
  ) {
    return this.marketplaceRepository.browseListings(query);
  }

  @Get('listings')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved marketplace listings!",
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ResponseMessage("Successfully retrieved marketplace listings!")
  async getListings(@Query('projectId') projectId?: string) {
    return this.marketplaceRepository.getActiveListings(projectId);
  }

  @Get('listing/:id')
  @ApiOkResponse({
    description: "Successfully retrieved listing details!",
  })
  @ResponseMessage("Successfully retrieved listing details!")
  async getListingById(@Param('id') id: string) {
    return this.marketplaceRepository.getListingById(id);
  }

  @Get('listing/:id/sales')
  @ApiOkResponse({
    description: "Successfully retrieved listing sales!",
  })
  @ResponseMessage("Successfully retrieved listing sales!")
  async getListingSales(@Param('id') id: string) {
    return this.marketplaceRepository.getListingSales(id);
  }

  @Get('project/:projectId/stats')
  @ApiOkResponse({
    description: "Successfully retrieved marketplace stats!",
  })
  @ResponseMessage("Successfully retrieved marketplace stats!")
  async getMarketplaceStats(@Param('projectId') projectId: string) {
    return this.marketplaceRepository.getMarketplaceStats(projectId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my-listings')
  @ApiOkResponse({
    description: "Successfully retrieved my listings!",
  })
  @ResponseMessage("Successfully retrieved my listings!")
  async getMyListings(@GetUser() user: User) {
    return this.marketplaceRepository.getMyListings(user.address);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my-published-projects')
  @ApiOkResponse({
    description: "Successfully retrieved my published projects!",
  })
  @ResponseMessage("Successfully retrieved my published projects!")
  async getMyPublishedProjects(
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number
  ) {
    return this.projectService.getMyProjects(
      {
        status: status as any || 'ALL',
        page: page || 1,
        perPage: perPage || 10,
      },
      user
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('purchased-datasets')
  @ApiOkResponse({
    description: "Successfully retrieved purchased datasets!",
  })
  @ResponseMessage("Successfully retrieved purchased datasets!")
  async getPurchasedDatasets(@GetUser() user: User) {
    return this.marketplaceRepository.getPurchasedDatasets(user.address);
  }
}
