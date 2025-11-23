import { transformProjectResponse } from "./project.transform"

export const transformSubmissionListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (item) => {
    return await transformSubmissionResponse(item);
  }));
}

export const transformSubmissionResponse = async (data: any) => {
  return {
    id: data?.id,
    network: data?.network,
    projectId: data?.projectId,
    contributor: data?.contributor,
    status: data?.status,
    rewardPaid: data?.rewardPaid,
    fullDatasetPublicKey: data?.fullDatasetPublicKey,
    submittedAt: data?.submittedAt,
    reviewedAt: data?.reviewedAt,
    project: data?.project ? await transformProjectResponse(data.project) : null,
  }
}