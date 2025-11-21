import { Module } from "@nestjs/common";
import { SetupIndexerService } from "./service/setup-indexer.service";
import { ProjectIndexerService } from "./service/project-indexer.service";

@Module({
  providers: [
    ProjectIndexerService,
    SetupIndexerService,
  ],
})
export class IndexerModule { }