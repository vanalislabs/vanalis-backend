export const ActivityAction = {
  CREATED_PROJECT: 'CREATED_PROJECT',
  SUBMIT_SUBMISSION: 'SUBMIT_SUBMISSION',
  REVIEWED_SUBMISSION: 'REVIEWED_SUBMISSION',
  EARN_SUBMISSION_REWARD: 'EARN_SUBMISSION_REWARD',
  CREATED_LISTING: 'CREATED_LISTING',
  PURCHASED_LISTING: 'PURCHASED_LISTING',
} as const

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]

export const ActivityLabel = {
  [ActivityAction.CREATED_PROJECT]: 'created',
  [ActivityAction.SUBMIT_SUBMISSION]: 'submitted submission to',
  [ActivityAction.REVIEWED_SUBMISSION]: 'reviewed',
  [ActivityAction.EARN_SUBMISSION_REWARD]: 'earned reward from',
  [ActivityAction.CREATED_LISTING]: 'listed',
  [ActivityAction.PURCHASED_LISTING]: 'purchased',
} as const

export type ActivityLabel = (typeof ActivityLabel)[keyof typeof ActivityLabel]

export const ActivityLabelDescription = {
  [ActivityAction.CREATED_PROJECT]: "{projectName}'s project",
  [ActivityAction.SUBMIT_SUBMISSION]: "{projectName}'s project",
  [ActivityAction.REVIEWED_SUBMISSION]: "{contributorName}'s submission on {projectName}",
  [ActivityAction.EARN_SUBMISSION_REWARD]: "{projectName}'s project submission",
  [ActivityAction.CREATED_LISTING]: "{projectName} to marketplace",
  [ActivityAction.PURCHASED_LISTING]: "{projectName} from marketplace",
} as const

export type ActivityLabelDescription = (typeof ActivityLabelDescription)[keyof typeof ActivityLabelDescription]
