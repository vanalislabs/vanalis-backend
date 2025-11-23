import { SuiClient, SuiEvent } from "@mysten/sui/client";
import { Injectable, Logger } from "@nestjs/common";
import { Prisma, Project, Submission, SubmissionStatus } from "prisma/generated/client";
import { NETWORK } from "src/constants/network.constants";
import { PROJECT_STATUS_FROM_NUMBER } from "src/constants/project.constants";
import { SUBMISSION_STATUS_FROM_NUMBER } from "src/constants/submission.constants";
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

    await this.retrieveAndSaveProject(parsedJson.project_id);

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

    await this.retrieveAndSaveProject(parsedJson.project_id);

    await this.retrieveAndSaveSubmission(parsedJson.submission_id);

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

    const project = await this.retrieveAndSaveProject(parsedJson.project_id);

    const submission = await this.retrieveAndSaveSubmission(parsedJson.submission_id);

    if (submission.status === SubmissionStatus.APPROVED) {
      const cryptoKeypair = await this.prisma.cryptoKeypair.findUnique({
        where: {
          creator_publicKey: {
            creator: submission.contributor,
            publicKey: submission.fullDatasetPublicKey,
          }
        },
      });

      if (cryptoKeypair) {
        const data = {
          address: project.curator,
          publicKey: submission.fullDatasetPublicKey,
        }

        await this.prisma.accountAccessCryptoKeypair.upsert({
          where: {
            address_publicKey: data
          },
          update: {},
          create: data,
        })
      }
    }

    // Save the event to the database
    await this.indexerRepository.saveEventLog(event);
  }

  async retrieveAndSaveProject(projectId: string): Promise<Project> {
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
      totalRewardPool: Number(projectFields?.total_reward_pool),
      targetSubmissions: Number(projectFields?.target_submissions),
      status: PROJECT_STATUS_FROM_NUMBER[projectFields?.status],
      submissionsCount: Number(projectFields?.submissions_count),
      approvedCount: Number(projectFields?.approved_count),
      rejectedCount: Number(projectFields?.rejected_count),
      createdAt: Number(projectFields?.created_at),
      deadline: Number(projectFields?.deadline),
    }

    const savedProject = await this.prisma.project.upsert({
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

    return savedProject;
  }

  async retrieveAndSaveSubmission(submissionId: string): Promise<Submission> {
    const submission = await this.client.getObject({
      id: submissionId,
      options: {
        showContent: true,
      },
    });

    const submissionFields: any = submission?.data?.content?.dataType === 'moveObject' ? submission?.data?.content?.fields : null;

    const data = {
      projectId: submissionFields?.project_id,
      contributor: submissionFields?.contributor,
      status: SUBMISSION_STATUS_FROM_NUMBER[submissionFields?.status],
      rewardPaid: Number(0),
      fullDatasetPublicKey: String(submissionFields?.full_dataset_public_key),
      submittedAt: Number(submissionFields?.submitted_at),
      reviewedAt: submissionFields?.reviewed_at ? Number(submissionFields?.reviewed_at) : null,
    }

    const savedSubmission = await this.prisma.submission.upsert({
      where: {
        id_network: {
          id: submissionId,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        ...data,
        id: submissionId,
        network: NETWORK?.env || '',
      },
    });

    return savedSubmission;
  }
}