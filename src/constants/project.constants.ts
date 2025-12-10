import { ProjectStatus } from "prisma/generated/enums";

export const PROJECT_STATUS_FROM_NUMBER: Record<number, ProjectStatus> = {
  0: ProjectStatus.COMING_SOON,
  1: ProjectStatus.OPEN,
  2: ProjectStatus.COMPLETED,
  3: ProjectStatus.CLOSED,
}

export const PROJECT_STATUS_TO_NUMBER: Record<ProjectStatus, number> = {
  [ProjectStatus.COMING_SOON]: 0,
  [ProjectStatus.OPEN]: 1,
  [ProjectStatus.COMPLETED]: 2,
  [ProjectStatus.CLOSED]: 3,
}