import { Injectable } from "@nestjs/common";
import { BrowseMarketplaceQueryDto } from "../dto/browse-marketplace-query.dto";
import { MarketplaceRepository } from "src/repositories/marketplace.repository";

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly marketplaceRepository: MarketplaceRepository,
  ) { }

  async browseListings(query: BrowseMarketplaceQueryDto) {
    return this.marketplaceRepository.browseListings(query);
  }

  async getActiveListings() {
    return this.marketplaceRepository.getActiveListings();
  }

  async getMarketplaceStats(projectId: string) {
    return this.marketplaceRepository.getMarketplaceStats(projectId);
  }

  async getListingById(listingId: string) {
    return this.marketplaceRepository.getListingById(listingId);
  }

  async getListingSales(listingId: string) {
    return this.marketplaceRepository.getListingSales(listingId);
  }

  async getMyListings(curatorAddress: string) {
    return this.marketplaceRepository.getMyListings(curatorAddress);
  }

  async getPurchasedDatasets(buyerAddress: string) {
    return this.marketplaceRepository.getPurchasedDatasets(buyerAddress);
  }
}