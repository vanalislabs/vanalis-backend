import { Injectable, Logger } from '@nestjs/common';
import { SuiClient, SuiEvent } from '@mysten/sui/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { NETWORK } from 'src/constants/network.constants';
import { IndexerRepository } from 'src/repositories/indexer.repository';
import { ActivityRepository } from 'src/repositories/activity.repository';
import { MarketplaceListing } from 'prisma/generated/client';
import { ActivityToken } from 'src/app/activity/types/activity.type';

@Injectable()
export class MarketplaceIndexerService {
  private readonly logger = new Logger(MarketplaceIndexerService.name);
  private readonly client = new SuiClient({ url: NETWORK?.rpcUrl || '' });

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexerRepository: IndexerRepository,
    private readonly activityRepository: ActivityRepository,
  ) { }

  async handleListingCreatedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleListingCreatedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling listing created event: ${error}`);
      }
    }
  }

  private async handleSingleListingCreatedEvent(event: SuiEvent) {
    const json = event.parsedJson as any;
    const listing = await this.retrieveAndSaveListing(json.id);

    if (listing) {
      // Save the created listing activity
      const id = `${event.id.txDigest}:${event.id.eventSeq}`;
      await this.activityRepository.saveCreatedListingActivity(id, listing.projectId, listing.id, event.sender, Number(event.timestampMs));
    }

    await this.indexerRepository.saveEventLog(event);
  }

  async handleListingUpdatedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleListingUpdatedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling listing updated event: ${error}`);
      }
    }
  }

  private async handleSingleListingUpdatedEvent(event: SuiEvent) {
    const json = event.parsedJson as any;
    const listing = await this.retrieveAndSaveListing(json.id);

    if (listing) {
      // Save the updated listing activity
      const id = `${event.id.txDigest}:${event.id.eventSeq}`;
      await this.activityRepository.saveUpdatedListingActivity(id, listing.projectId, listing.id, event.sender, Number(event.timestampMs));
    }

    await this.indexerRepository.saveEventLog(event);
  }

  async handleListingPurchasedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleListingPurchasedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling listing purchased event: ${error}`);
      }
    }
  }

  private async handleSingleListingPurchasedEvent(event: SuiEvent) {
    const json = event.parsedJson as any;
    const listingSale = await this.upsertListingSaleFromEvent(json);
    const listing = await this.retrieveAndSaveListing(json.listing_id);

    if (listing && listingSale) {
      // Save the purchased listing activity
      const id = `${event.id.txDigest}:${event.id.eventSeq}`;
      const paidAmount: ActivityToken[] = [
        {
          amount: listingSale.paidAmount,
          decimals: 9,
          symbol: 'SUI',
        },
      ]
      await this.activityRepository.savePurchasedListingActivity(id, listing.projectId, listing.id, paidAmount, listing.curator, event.sender, Number(event.timestampMs));
    }

    await this.indexerRepository.saveEventLog(event);
  }

  async retrieveAndSaveListing(listingId: string): Promise<MarketplaceListing | null> {
    const listing = await this.client.getObject({
      id: listingId,
      options: { showContent: true },
    });

    const listingFields: any =
      listing?.data?.content?.dataType === 'moveObject'
        ? listing?.data?.content?.fields
        : null;

    if (!listingFields) return null;

    const data = {
      projectId: listingFields.project_id,
      price: BigInt(listingFields.price),
      datasetCollectionBlobId: listingFields.dataset_collection_blob_id,
      datasetCollectionPublicKey: listingFields.dataset_collection_public_key,
      lastSaleEpochTimestamp: BigInt(
        listingFields.last_sale_epoch_timestamp ?? 0,
      ),
      totalSalesAmount: BigInt(listingFields.total_sales_amount ?? 0),
      totalSalesCount: BigInt(listingFields.total_sales_count ?? 0),
      curator: listingFields.curator,
      createdAt: BigInt(listingFields.created_at),
      updatedAt: BigInt(listingFields.updated_at),
    };

    return this.prisma.marketplaceListing.upsert({
      where: { id_network: { id: listingId, network: NETWORK?.env || '' } },
      update: data,
      create: { ...data, id: listingId, network: NETWORK?.env || '' },
    });
  }

  async upsertListingSaleFromEvent(eventData: any) {
    const data = {
      listingId: eventData.listing_id,
      buyer: eventData.buyer,
      paidAmount: BigInt(eventData.paid_amount),
      boughtAt: BigInt(eventData.bought_at),
    };

    return this.prisma.listingSale.upsert({
      where: { id_network: { id: eventData.sale_id, network: NETWORK?.env || '' } },
      update: data,
      create: { ...data, id: eventData.sale_id, network: NETWORK?.env || '' },
    });
  }
}
