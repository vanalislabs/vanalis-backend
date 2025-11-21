import { SubmissionStatus } from "prisma/generated/enums"

export const SUBMISSION_STATUS_FROM_NUMBER = {
  0: SubmissionStatus.PENDING,
  1: SubmissionStatus.APPROVED,
  2: SubmissionStatus.REJECTED,
}

export const SUBMISSION_STATUS_TO_NUMBER = {
  [SubmissionStatus.PENDING]: 0,
  [SubmissionStatus.APPROVED]: 1,
  [SubmissionStatus.REJECTED]: 2,
}