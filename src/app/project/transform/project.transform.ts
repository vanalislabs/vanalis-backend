import { transformSubmissionListResponse } from "./submission.transform";

export const transformProjectListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (data) => {
    return await transformProjectResponse(data);
  }));
}

export const transformProjectResponse = async (data: any) => {
  return {
    ...data,
    submissions: data?.submissions ? await transformSubmissionListResponse(data.submissions) : undefined,
  }
}