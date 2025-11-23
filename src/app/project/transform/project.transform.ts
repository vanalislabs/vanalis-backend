import { Project } from "prisma/generated/client"
import { transformSubmissionListResponse } from "./submission.transform";

export const transformProjectListResponse = async (project: any[]) => {
  return await Promise.all(project.map(async (project) => {
    return await transformProjectResponse(project);
  }));
}

export const transformProjectResponse = async (project: any) => {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl,
    rewardPool: project.rewardPool,
    targetSubmissions: project.targetSubmissions,
    status: project.status,
    submissionsCount: project.submissionsCount,
    approvedCount: project.approvedCount,
    rejectedCount: project.rejectedCount,
    createdAt: project.createdAt,
    deadline: project.deadline,
    submissions: project?.submissions ? await transformSubmissionListResponse(project.submissions) : null,
  }
}