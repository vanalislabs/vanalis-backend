import { SuiClient, SuiEvent } from "@mysten/sui/client";
import { Injectable, Logger } from "@nestjs/common";
import { Prisma, SubmissionStatus } from "prisma/generated/client";
import { NETWORK } from "src/constants/network.constants";
import { PROJECT_STATUS_FROM_NUMBER } from "src/constants/project.constants";
import { IndexerRepository } from "src/repositories/indexer.repository";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class ProjectIndexerService {
  private readonly logger = new Logger(ProjectIndexerService.name);
  private readonly client: SuiClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexerRepository: IndexerRepository,
  ) {
    this.client = new SuiClient({
      url: NETWORK?.rpcUrl || '',
    });
  }

  async handleProjectCreatedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleProjectCreatedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling project created event: ${error}`);
      }
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

  async handleSubmissionReceivedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleSubmissionReceivedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling submission received event: ${error}`);
      }
    }
  }

  async handleSingleSubmissionReceivedEvent(event: SuiEvent) {
    const parsedJson = event.parsedJson as any;

    const project = await this.prisma.project.findUnique({
      where: {
        id_network: {
          id: parsedJson.project_id,
          network: NETWORK?.env || '',
        },
      },
    });

    if (!project) {
      await this.retrieveAndSaveProject(parsedJson.project_id);
    }

    const data = {
      projectId: parsedJson.project_id,
      fullDatasetPublicKey: Uint8Array.from(parsedJson.full_dataset_public_key),
      contributor: parsedJson.contributor,
      submittedAt: Number(parsedJson.submitted_at),
    }

    await this.prisma.submission.upsert({
      where: {
        id_network: {
          id: parsedJson.submission_id,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        ...data,
        id: parsedJson.submission_id,
        network: NETWORK?.env || '',
        rewardPaid: Number(0),
        status: SubmissionStatus.PENDING,
        reviewedAt: null,
      },
    });

    // Save the event to the database
    await this.indexerRepository.saveEventLog(event);
  }

  async handleSubmissionReviewedEvent(events: SuiEvent[], type: string) {
    for (const event of events) {
      try {
        await this.handleSingleSubmissionReviewedEvent(event);
      } catch (error) {
        this.logger.error(`Error handling submission reviewed event: ${error}`);
      }
    }
  }

  async handleSingleSubmissionReviewedEvent(event: SuiEvent) {
    const parsedJson = event.parsedJson as any;

    const project = await this.prisma.project.findUnique({
      where: {
        id_network: {
          id: parsedJson.project_id,
          network: NETWORK?.env || '',
        },
      },
    });

    if (!project) {
      await this.retrieveAndSaveProject(parsedJson.project_id);
    }

    const submission = await this.client.getObject({
      id: parsedJson.submission_id,
      options: {
        showContent: true,
      },
    });

    const submissionFields: any = submission?.data?.content?.dataType === 'moveObject' ? submission?.data?.content?.fields : null;
    const updatedData = {
      status: parsedJson.approved ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED,
      rewardPaid: Number(parsedJson?.reward_paid),
      reviewedAt: Number(parsedJson?.reviewed_at),
    }

    await this.prisma.submission.upsert({
      where: {
        id_network: {
          id: parsedJson.submission_id,
          network: NETWORK?.env || '',
        },
      },
      update: updatedData,
      create: {
        ...updatedData,
        id: parsedJson.submission_id,
        network: NETWORK?.env || '',
        projectId: parsedJson.project_id,
        contributor: submissionFields?.contributor,
        fullDatasetPublicKey: Uint8Array.from(submissionFields?.full_dataset_public_key),
        submittedAt: Number(submissionFields?.submitted_at),
      }
    });

    // Save the event to the database
    await this.indexerRepository.saveEventLog(event);
  }

  async retrieveAndSaveProject(projectId: string) {
    const project = await this.client.getObject({
      id: projectId,
      options: {
        showContent: true,
      },
    });

    const projectFields: any = project?.data?.content?.dataType === 'moveObject' ? project?.data?.content?.fields : null;

    const data = {
      curator: projectFields?.curator,
      title: projectFields?.title,
      description: projectFields?.description,
      submissionRequirements: projectFields?.submission_requirements,
      dataType: projectFields?.data_type,
      category: projectFields?.category,
      imageUrl: projectFields?.image_url,
      rewardPool: Number(projectFields?.reward_pool),
      targetSubmissions: Number(projectFields?.target_submissions),
      status: PROJECT_STATUS_FROM_NUMBER[projectFields?.status],
      submissionsCount: Number(projectFields?.submissions_count),
      approvedCount: Number(projectFields?.approved_count),
      rejectedCount: Number(projectFields?.rejected_count),
      createdAt: Number(projectFields?.created_at),
      deadline: Number(projectFields?.deadline),
    }

    await this.prisma.project.upsert({
      where: {
        id_network: {
          id: projectId,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        ...data,
        id: projectId,
        network: NETWORK?.env || '',
      },
    });

    return project;
  }
}