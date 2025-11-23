import { Module } from "@nestjs/common";
import { SetupIndexerService } from "./service/setup-indexer.service";
import { ProjectIndexerService } from "./service/project-indexer.service";
import { MarketplaceIndexerService } from "./service/marketplace-indexer.service";

@Module({
  providers: [
    ProjectIndexerService,
    SetupIndexerService,
    MarketplaceIndexerService
  ],
})
export class IndexerModule { }