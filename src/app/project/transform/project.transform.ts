import { transformSubmissionListResponse } from "./submission.transform";

export const transformProjectListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (data) => {
    return await transformProjectResponse(data);
  }));
}

export const transformProjectResponse = async (data: any) => {
  return {
    id: data?.id,
    network: data?.network,
    title: data?.title,
    description: data?.description,
    imageUrl: data?.imageUrl,
    rewardPool: data?.rewardPool,
    targetSubmissions: data?.targetSubmissions,
    status: data?.status,
    submissionsCount: data?.submissionsCount,
    approvedCount: data?.approvedCount,
    rejectedCount: data?.rejectedCount,
    createdAt: data?.createdAt,
    deadline: data?.deadline,
    submissions: data?.submissions ? await transformSubmissionListResponse(data.submissions) : null,
  }
}