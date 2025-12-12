import { Injectable } from "@nestjs/common";
import { BrowseMarketplaceQueryDto } from "src/app/marketplace/dto/browse-marketplace-query.dto";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class MarketplaceRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getMarketplaceStats(projectId: string) {
    const listings = await this.prisma.marketplaceListing.findMany({
      where: { projectId },
      include: {
        sales: true,
      }
    });

    const totalListings = listings.length;
    const totalSales = listings.reduce((sum, listing) => sum + Number(listing.totalSalesCount), 0);
    const totalVolume = listings.reduce((sum, listing) => sum + Number(listing.totalSalesAmount), 0);

    return {
      totalListings,
      totalSales,
      totalVolume: BigInt(totalVolume),
      averagePrice: totalSales > 0 ? BigInt(totalVolume / totalSales) : BigInt(0)
    };
  }

  async getListingById(listingId: string) {
    return this.prisma.marketplaceListing.findUnique({
      where: {
        id_network: {
          id: listingId,
          network: process.env.NETWORK_ENV || 'testnet',
        }
      },
      include: {
        sales: true,
      }
    });
  }

  async getListingSales(listingId: string) {
    return this.prisma.listingSale.findMany({
      where: {
        listingId,
      },
      orderBy: {
        boughtAt: 'desc'
      }
    });
  }

  async getMyListings(curatorAddress: string) {
    return this.prisma.marketplaceListing.findMany({
      where: {
        curator: curatorAddress,
      },
      include: {
        sales: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getPurchasedDatasets(buyerAddress: string) {
    return this.prisma.listingSale.findMany({
      where: {
        buyer: buyerAddress,
      },
      include: {
        listing: true,
      },
      orderBy: {
        boughtAt: 'desc'
      }
    });
  }
}
