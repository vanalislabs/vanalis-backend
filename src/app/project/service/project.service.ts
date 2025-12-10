import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectStatus, SubmissionStatus } from "prisma/generated/enums";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { PaginateFunction } from "src/commons/paginator.common";
import { paginator } from "src/commons/paginator.common";
import { Prisma, User } from "prisma/generated/client";
import { BrowseProjectQueryDto } from "../dto/browse-project-query.dto";
import { NETWORK } from "src/constants/network.constants";
import { MyProjectQueryDto } from "../dto/my-project-query.dto";
import { MySubmissionQueryDto } from "../dto/my-submission-query.dto";
import { transformProjectListResponse, transformProjectResponse } from "../transform/project.transform";
import { transformSubmissionListResponse, transformSubmissionResponse } from "../transform/submission.transform";

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { }

  async getFeaturedProjects() {
    const projects = await this.prisma.project.findMany({
      where: {
        status: ProjectStatus.OPEN,
        network: NETWORK?.env,
      },
      orderBy: {
        deadline: 'asc',
      },
      take: 3,
    });

    return transformProjectListResponse(projects);
  }

  async browseProjects(query: BrowseProjectQueryDto) {
    const queryProject: Prisma.ProjectFindManyArgs = {
      where: {
        network: NETWORK?.env,
      },
      orderBy: {
        deadline: 'asc',
      },
    };

    if (query.status) {
      switch (query.status) {
        case 'ALL':
          break;
        case ProjectStatus.OPEN:
          queryProject.where!.status = ProjectStatus.OPEN;
          break;
        case ProjectStatus.COMPLETED:
          queryProject.where!.status = ProjectStatus.COMPLETED;
          break;
        case ProjectStatus.CLOSED:
          queryProject.where!.status = ProjectStatus.CLOSED;
          break;
      }
    }

    if (query.search) {
      queryProject.where = {
        ...queryProject.where,
        title: {
          search: query.search,
        },
      }
    }

    if (query.sortBy) {
      queryProject.orderBy = {
        [query.sortBy as any]: query.sortOrder || 'desc',
      }
    } else {
      queryProject.orderBy = {
        createdAt: 'desc',
      };
    }

    const projects = await paginate(
      this.prisma.project,
      queryProject,
      {
        page: query.page,
        perPage: query.perPage,
      },
      transformProjectListResponse,
    );

    return projects;
  }

  async getProjectDetail(id: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id_network: {
          id: id,
          network: NETWORK?.env || '',
        },
      },
      include: {
        submissions: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return transformProjectResponse(project);
  }

  async getSubmissionDetail(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: {
        id_network: {
          id: id,
          network: NETWORK?.env || '',
        },
      },
      include: {
        project: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return transformSubmissionResponse(submission);
  }

  async getMyProjects(query: MyProjectQueryDto, user: User) {
    const queryProject: Prisma.ProjectFindManyArgs = {
      where: {
        network: NETWORK?.env || '',
        curator: user.address,
      },
    };

    if (query.status) {
      switch (query.status) {
        case 'ALL':
          break;
        case ProjectStatus.OPEN:
          queryProject.where!.status = ProjectStatus.OPEN;
          break;
        case ProjectStatus.COMPLETED:
          queryProject.where!.status = ProjectStatus.COMPLETED;
          break;
        case ProjectStatus.CLOSED:
          queryProject.where!.status = ProjectStatus.CLOSED;
          break;
      }
    }

    const projects = await paginate(
      this.prisma.project,
      queryProject,
      {
        page: query.page,
        perPage: query.perPage,
      },
      transformProjectListResponse,
    );

    return projects;
  }

  async getMySubmissions(query: MySubmissionQueryDto, user: User) {
    const querySubmission: Prisma.SubmissionFindManyArgs = {
      where: {
        network: NETWORK?.env || '',
        contributor: user.address,
      },
      include: {
        project: true,
      },
      omit: {
        fullDatasetPublicKey: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    };

    if (query.status) {
      switch (query.status) {
        case 'ALL':
          break;
        case SubmissionStatus.PENDING:
          querySubmission.where!.status = SubmissionStatus.PENDING;
          break;
        case SubmissionStatus.APPROVED:
          querySubmission.where!.status = SubmissionStatus.APPROVED;
          break;
        case SubmissionStatus.REJECTED:
          querySubmission.where!.status = SubmissionStatus.REJECTED;
          break;
      }
    }

    const submissions = await paginate(
      this.prisma.submission,
      querySubmission,
      {
        page: query.page,
        perPage: query.perPage,
      },
      transformSubmissionListResponse,
    );

    return submissions;
  }
}