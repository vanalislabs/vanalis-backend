import { Injectable } from "@nestjs/common";
import { BrowseMarketplaceQueryDto } from "../dto/browse-marketplace-query.dto";
import { MarketplaceRepository } from "src/repositories/marketplace.repository";
import { PaginateFunction, paginator } from "src/commons/paginator.common";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { NETWORK } from "src/constants/network.constants";
import { Prisma } from "prisma/generated/browser";
import { transformMarketplaceListingListResponse, transformMarketplaceListingResponse } from "../transform/marketplace.transform";

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketplaceRepository: MarketplaceRepository,
  ) { }

  async browseListings(query: BrowseMarketplaceQueryDto) {
    const queryMarketplace: Prisma.MarketplaceListingFindManyArgs = {
      where: {
        network: NETWORK?.env,
      },
      include: {
        sales: true,
      },
      orderBy: {},
    };

    if (query?.search || query?.category || query?.isAvailable !== undefined) {
      queryMarketplace.where!.project = {};
      if (query?.search) {
        queryMarketplace.where!.project.title = {
          search: query.search,
        };
      }
      if (query?.category) {
        queryMarketplace.where!.project.category = query.category;
      }
      if (query?.isAvailable !== undefined) {
        queryMarketplace.where!.project.deadline = query.isAvailable ? { gt: Date.now() } : { lt: Date.now() };
      }
    }

    if (query?.minPrice || query?.maxPrice) {
      queryMarketplace.where!.price = {};
      if (query.minPrice) {
        queryMarketplace.where!.price.gte = BigInt(query.minPrice);
      }
      if (query.maxPrice) {
        queryMarketplace.where!.price.lte = BigInt(query.maxPrice);
      }
    }

    const orderBy: any = {};
    if (query?.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const marketplaceListings = await paginate(
      this.prisma.marketplaceListing,
      queryMarketplace,
      {
        page: query.page,
        perPage: query.perPage,
      },
      transformMarketplaceListingListResponse,
    );

    return marketplaceListings;
  }

  async getMarketplaceStats(projectId: string) {
    return this.marketplaceRepository.getMarketplaceStats(projectId);
  }

  async getListingById(listingId: string) {
    const listing = await this.marketplaceRepository.getListingById(listingId);
    return transformMarketplaceListingResponse(listing);
  }

  async getListingSales(listingId: string) {
    return this.marketplaceRepository.getListingSales(listingId);
  }

  async getMyListings(curatorAddress: string) {
    const listings = await this.marketplaceRepository.getMyListings(curatorAddress);
    return transformMarketplaceListingListResponse(listings);
  }

  async getPurchasedDatasets(buyerAddress: string) {
    return this.marketplaceRepository.getPurchasedDatasets(buyerAddress);
  }
}