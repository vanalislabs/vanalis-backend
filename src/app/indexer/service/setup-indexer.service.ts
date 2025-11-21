import { Injectable, Logger } from "@nestjs/common";
import { NETWORK, PACKAGE_ID } from "src/constants/network.constants";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { EventExecutionResult, EventTracker, SuiEventsCursor } from "../types/indexer.type";
import { ProjectIndexerService } from "./project-indexer.service";
import { ConfigService } from "src/shared/config/config.service";
import { type EventId, SuiClient } from "@mysten/sui/client";

@Injectable()
export class SetupIndexerService {
  private readonly logger = new Logger(SetupIndexerService.name);
  private client: SuiClient;

  private readonly eventsToTrack: EventTracker[] = [];

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly projectIndexerService: ProjectIndexerService,
  ) {
    this.client = new SuiClient({
      url: NETWORK?.rpcUrl || '',
    });

    this.eventsToTrack.push({
      type: `${PACKAGE_ID}::project::ProjectCreatedEvent`,
      filter: {
        MoveEventType: `${PACKAGE_ID}::project::ProjectCreatedEvent`,
      },
      callback: this.projectIndexerService.handleProjectCreatedEvent.bind(this.projectIndexerService),
    });

    this.eventsToTrack.push({
      type: `${PACKAGE_ID}::project::SubmissionReceivedEvent`,
      filter: {
        MoveEventType: `${PACKAGE_ID}::project::SubmissionReceivedEvent`,
      },
      callback: this.projectIndexerService.handleSubmissionReceivedEvent.bind(this.projectIndexerService),
    });

    this.eventsToTrack.push({
      type: `${PACKAGE_ID}::project::SubmissionReviewedEvent`,
      filter: {
        MoveEventType: `${PACKAGE_ID}::project::SubmissionReviewedEvent`,
      },
      callback: this.projectIndexerService.handleSubmissionReviewedEvent.bind(this.projectIndexerService),
    });
  }

  async onModuleInit() {
    for (const event of this.eventsToTrack) {
      this.runEventJob(this.client, event, await this.getLatestCursor(event));
    }
  }

  async runEventJob(client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) {
    const result = await this.executeEventJob(client, tracker, cursor);

    setTimeout(
      () => {
        this.runEventJob(client, tracker, result.cursor);
      },
      result.hasNextPage ? 0 : this.config.indexer.pollingInterval,
    );
  };

  async executeEventJob(
    client: SuiClient,
    tracker: EventTracker,
    cursor: SuiEventsCursor,
  ): Promise<EventExecutionResult> {
    try {
      const { data, hasNextPage, nextCursor } = await client.queryEvents({
        query: tracker.filter,
        cursor,
        order: 'ascending',
      });

      await tracker.callback(data, tracker.type);

      if (nextCursor && data.length > 0) {
        await this.saveLatestCursor(tracker, nextCursor);

        return {
          cursor: nextCursor,
          hasNextPage,
        };
      }
    } catch (e) {
      this.logger.error(e);
    }

    return {
      cursor,
      hasNextPage: false,
    };
  };

  async getLatestCursor(tracker: EventTracker) {
    const cursor = await this.prisma.cursorEvent.findUnique({
      where: {
        type_network: {
          type: tracker.type,
          network: NETWORK?.env || '',
        },
      },
    });

    return cursor || undefined;
  };

  async saveLatestCursor(tracker: EventTracker, cursor: EventId) {
    const data = {
      eventSeq: cursor.eventSeq,
      txDigest: cursor.txDigest,
    };

    return this.prisma.cursorEvent.upsert({
      where: {
        type_network: {
          type: tracker.type,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        type: tracker.type,
        network: NETWORK?.env || '',
        ...data
      },
    });
  };
}