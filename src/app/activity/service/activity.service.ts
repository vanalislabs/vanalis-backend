import { Injectable } from "@nestjs/common";
import { Activity, Prisma, Project, User } from "prisma/generated/client";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { ActivityFeedQueryDto } from "../dto/activity-feed-query.dto";
import { ActivityByProjectQueryDto } from "../dto/activity-by-project-query.dto";
import { MyActivitiesQueryDto } from "../dto/my-activities-query.dto";
import { PaginateFunction } from "src/commons/paginator.common";
import { paginator } from "src/commons/paginator.common";
import { ActivityMetadata } from "../types/activity.type";
import { ActivityAction, ActivityLabel, ActivityLabelDescription } from "src/constants/activity.constants";

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async getActivityFeed(query: ActivityFeedQueryDto) {
    const queryActivity: Prisma.ActivityFindManyArgs = {
      where: {},
    };

    if (query?.action) {
      queryActivity.where = {
        action: query.action,
      };
    }

    if (query?.sortBy) {
      queryActivity.orderBy = {
        [query.sortBy as any]: query.sortOrder || 'desc',
      }
    } else {
      queryActivity.orderBy = {
        timestamp: 'desc',
      };
    }

    const activities = await paginate(
      this.prisma.activity,
      queryActivity,
      {
        page: query.page,
        perPage: query.perPage,
      },
    );

    activities.data = await this.transformActivityListResponse(activities.data as any[]);

    return activities;
  }

  async getActivityFeedByProject(projectId: string, query: ActivityByProjectQueryDto) {
    const queryActivity: Prisma.ActivityFindManyArgs = {
      where: {
        metadata: {
          path: ['projectId'],
          equals: [projectId],
        },
      },
    };

    if (query?.sortBy) {
      queryActivity.orderBy = {
        [query.sortBy as any]: query.sortOrder || 'desc',
      }
    } else {
      queryActivity.orderBy = {
        timestamp: 'desc',
      };
    }

    const activities = await paginate(
      this.prisma.activity,
      queryActivity,
      {
        page: query.page,
        perPage: query.perPage,
      },
    );

    activities.data = await this.transformActivityListResponse(activities.data as any[]);

    return activities;
  }

  async getMyActivities(query: MyActivitiesQueryDto, user: User) {
    const queryActivity: Prisma.ActivityFindManyArgs = {
      where: {
        actor: user.address,
      },
    };

    if (query?.action) {
      queryActivity.where = {
        ...queryActivity.where,
        action: query.action,
      };
    }

    if (query?.sortBy) {
      queryActivity.orderBy = {
        [query.sortBy as any]: query.sortOrder || 'desc',
      }
    } else {
      queryActivity.orderBy = {
        timestamp: 'desc',
      };
    }

    const activities = await paginate(
      this.prisma.activity,
      queryActivity,
      {
        page: query.page,
        perPage: query.perPage,
      },
    );

    activities.data = await this.transformActivityListResponse(activities.data as any[]);

    return activities;
  }

  async transformActivityListResponse(activities: Activity[]) {
    const retrieveProjectIds = activities.flatMap((activity) => (activity.metadata as unknown as ActivityMetadata)?.projectId ?? []);
    const retrieveContributorAddresses = activities.flatMap((activity) => (activity.metadata as unknown as ActivityMetadata)?.contributor ?? []);
    const retrieveCuratorAddresses = activities.flatMap((activity) => (activity.metadata as unknown as ActivityMetadata)?.curator ?? []);
    const retrieveBuyerAddresses = activities.flatMap((activity) => (activity.metadata as unknown as ActivityMetadata)?.buyer ?? []);

    const projectIds = Array.from(new Set(retrieveProjectIds));
    const userAddresses = Array.from(new Set([...retrieveContributorAddresses, ...retrieveCuratorAddresses, ...retrieveBuyerAddresses]));

    const projects = await this.prisma.project.findMany({
      where: {
        id: {
          in: projectIds,
        },
      },
    });
    const users = await this.prisma.user.findMany({
      where: {
        address: {
          in: userAddresses,
        },
      },
    });

    return activities.map((activity) => {
      const label = this.generateActivityLabel(activity, projects, users);
      return {
        ...activity,
        ...label,
      };
    });
  }

  generateActivityLabel(activity: Activity, projects: Project[], users: User[]): {
    activityLabel: string;
    activityLabelDescription: string;
  } {
    let activityLabel = '';
    let activityLabelDescription = '';

    const activityMetadata = activity.metadata as unknown as ActivityMetadata;
    const projectName = projects.find((project) => project.id === activityMetadata?.projectId)?.title || '';

    switch (activity.action) {
      case ActivityAction.CREATED_PROJECT:
        activityLabel = ActivityLabel.CREATED_PROJECT;
        activityLabelDescription = ActivityLabelDescription.CREATED_PROJECT.replace('{projectName}', projectName);
        break;
      case ActivityAction.CLOSED_PROJECT:
        activityLabel = ActivityLabel.CLOSED_PROJECT;
        activityLabelDescription = ActivityLabelDescription.CLOSED_PROJECT.replace('{projectName}', projectName);
        break;
      case ActivityAction.SUBMIT_SUBMISSION:
        activityLabel = ActivityLabel.SUBMIT_SUBMISSION;
        activityLabelDescription = ActivityLabelDescription.SUBMIT_SUBMISSION.replace('{projectName}', projectName);
        break;
      case ActivityAction.REVIEWED_SUBMISSION:
        let contributor = users.find((user) => user.address === activityMetadata?.contributor);
        let contributorName = contributor?.username || contributor?.address || '';

        activityLabel = ActivityLabel.REVIEWED_SUBMISSION;
        activityLabelDescription = ActivityLabelDescription.REVIEWED_SUBMISSION.replace('{contributorName}', contributorName).replace('{projectName}', projectName);
        break;
      case ActivityAction.EARN_SUBMISSION_REWARD:
        activityLabel = ActivityLabel.EARN_SUBMISSION_REWARD;
        activityLabelDescription = ActivityLabelDescription.EARN_SUBMISSION_REWARD.replace('{projectName}', projectName);
        break;
      case ActivityAction.CREATED_LISTING:
        activityLabel = ActivityLabel.CREATED_LISTING;
        activityLabelDescription = ActivityLabelDescription.CREATED_LISTING.replace('{projectName}', projectName);
        break;
      case ActivityAction.UPDATED_LISTING:
        activityLabel = ActivityLabel.UPDATED_LISTING;
        activityLabelDescription = ActivityLabelDescription.UPDATED_LISTING.replace('{projectName}', projectName);
        break;
      case ActivityAction.PURCHASED_LISTING:
        activityLabel = ActivityLabel.PURCHASED_LISTING;
        activityLabelDescription = ActivityLabelDescription.PURCHASED_LISTING.replace('{projectName}', projectName);
        break;
    }

    return {
      activityLabel,
      activityLabelDescription,
    }
  }
}