import { Submission } from "prisma/generated/client";
import { transformProjectResponse } from "./project.transform"

export const transformSubmissionListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (item) => {
    return await transformSubmissionResponse(item);
  }));
}

export const transformSubmissionResponse = async (data: any) => {
  return {
    id: data.id,
    projectId: data.projectId,
    contributor: data.contributor,
    status: data.status,
    rewardPaid: data.rewardPaid,
    fullDatasetPublicKey: Buffer.from(data?.fullDatasetPublicKey as Uint8Array).toString('hex'),
    project: data?.project ? await transformProjectResponse(data.project) : null,
  }
}