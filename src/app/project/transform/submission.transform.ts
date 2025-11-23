import { transformProjectResponse } from "./project.transform"

export const transformSubmissionListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (item) => {
    return await transformSubmissionResponse(item);
  }));
}

export const transformSubmissionResponse = async (data: any) => {
  return {
    ...data,
    project: data?.project ? await transformProjectResponse(data.project) : null,
  }
}