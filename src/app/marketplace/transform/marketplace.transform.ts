import { transformProjectResponse } from "src/app/project/transform/project.transform";

export const transformMarketplaceListingListResponse = async (data: any[]) => {
  return await Promise.all(data.map(async (data) => {
    return await transformMarketplaceListingResponse(data);
  }));
}

export const transformMarketplaceListingResponse = async (data: any) => {
  const now = Date.now();
  return {
    ...data,
    isAvailable: now < (data?.project?.deadline ?? 0) ? true : false,
    project: data?.project ? await transformProjectResponse(data.project) : undefined,
  }
}