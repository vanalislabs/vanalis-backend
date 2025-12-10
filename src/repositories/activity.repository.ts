import { Injectable } from "@nestjs/common";
import { Activity, Prisma } from "prisma/generated/client";
import { InputJsonValue } from "prisma/generated/internal/prismaNamespace";
import { ActivityMetadata, ActivityToken } from "src/app/activity/types/activity.type";
import { ActivityAction } from "src/constants/activity.constants";
import { NETWORK } from "src/constants/network.constants";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) { }

  async saveCreatedProjectActivity(id: string, projectId: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      curator: actor,
    }
    const data = {
      actor,
      action: ActivityAction.CREATED_PROJECT,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    };

    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async saveSubmittedSubmissionActivity(id: string, projectId: string, submissionId: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      submissionId,
      contributor: actor,
    }
    const data = {
      actor,
      action: ActivityAction.SUBMIT_SUBMISSION,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    }
    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async saveReviewedSubmissionActivity(id: string, projectId: string, submissionId: string, contributor: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      submissionId,
      contributor,
      curator: actor,
    }
    const data = {
      actor,
      action: ActivityAction.REVIEWED_SUBMISSION,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    }
    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async saveEarnedSubmissionRewardActivity(id: string, projectId: string, submissionId: string, rewards: ActivityToken[], curator: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      submissionId,
      rewards,
      curator,
      contributor: actor,
    }
    const data = {
      actor,
      action: ActivityAction.EARN_SUBMISSION_REWARD,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    }
    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async saveCreatedListingActivity(id: string, projectId: string, listingId: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      listingId,
      curator: actor,
    }
    const data = {
      actor,
      action: ActivityAction.CREATED_LISTING,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    }
    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async savePurchasedListingActivity(id: string, projectId: string, listingId: string, paid: ActivityToken[], curator: string, actor: string, timestamp: number | bigint) {
    const metadata: ActivityMetadata = {
      projectId,
      listingId,
      paid,
      buyer: actor,
    }
    const data = {
      actor,
      action: ActivityAction.PURCHASED_LISTING,
      metadata: metadata as unknown as InputJsonValue,
      timestamp,
    }
    const savedActivity = await this.saveActivity(id, data);

    return savedActivity;
  }

  async saveActivity(id: string, data: Prisma.ActivityUncheckedUpdateInput): Promise<Activity> {
    return this.prisma.activity.upsert({
      where: {
        id_network: {
          id,
          network: NETWORK?.env || '',
        },
      },
      update: data,
      create: {
        ...(data as Prisma.ActivityUncheckedCreateInput),
        id,
        network: NETWORK?.env || '',
        actor: data.actor as string,
      },
    });
  }
}