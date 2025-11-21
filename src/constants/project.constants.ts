import { ProjectStatus } from "prisma/generated/enums";

export const PROJECT_STATUS_FROM_NUMBER: Record<number, ProjectStatus> = {
  0: ProjectStatus.DRAFT,
  1: ProjectStatus.OPEN,
  2: ProjectStatus.COMPLETED,
  3: ProjectStatus.PUBLISHED,
}

export const PROJECT_STATUS_TO_NUMBER: Record<ProjectStatus, number> = {
  [ProjectStatus.DRAFT]: 0,
  [ProjectStatus.OPEN]: 1,
  [ProjectStatus.COMPLETED]: 2,
  [ProjectStatus.PUBLISHED]: 3,
}