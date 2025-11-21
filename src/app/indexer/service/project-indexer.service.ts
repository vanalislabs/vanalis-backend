import { SuiEvent } from "@mysten/sui/client";
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import { NETWORK } from "src/constants/network.constants";
import { PROJECT_STATUS_FROM_NUMBER } from "src/constants/project.constants";
import { IndexerRepository } from "src/repositories/indexer.repository";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class ProjectIndexerService {
  private readonly logger = new Logger(ProjectIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexerRepository: IndexerRepository,
  ) { }

  async handleProjectCreatedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      await this.handleSingleProjectCreatedEvent(event);
    }
  }

  async handleSingleProjectCreatedEvent(event: SuiEvent) {
    const parsedJson = event.parsedJson as any;
    const data = {
      curator: parsedJson.curator,
      title: parsedJson.title,
      description: parsedJson.description,
      submissionRequirements: parsedJson.submission_requirements,
      dataType: parsedJson.data_type,
      category: parsedJson.category,
      imageUrl: parsedJson.image_url,
      rewardPool: Number(parsedJson.reward_pool),
      targetSubmissions: Number(parsedJson.target_submissions),
      status: PROJECT_STATUS_FROM_NUMBER[parsedJson.status],
      submissionsCount: Number(parsedJson.submissions_count),
      approvedCount: Number(parsedJson.approved_count),
      rejectedCount: Number(parsedJson.rejected_count),
      createdAt: Number(parsedJson.created_at),
      deadline: Number(parsedJson.deadline),
    }

    await this.prisma.project.upsert({
      where: {
        id_network: {
          id: parsedJson.project_id,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        ...data,
        id: parsedJson.project_id,
        network: NETWORK?.env || '',
      },
    });

    // Save the event to the database
    await this.indexerRepository.saveEventLog(event);
  }
}