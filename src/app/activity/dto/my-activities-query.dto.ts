import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";
import { ActivityAction, ActivityFeedOrderBy } from "src/constants/activity.constants";

export class MyActivitiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['ALL', ...Object.values(ActivityAction)],
    description: 'Filter activities by action',
  })
  @IsOptional()
  @IsIn(['ALL', ...Object.values(ActivityAction)])
  action?: ActivityAction | 'ALL';

  @ApiPropertyOptional({
    enum: Object.values(ActivityFeedOrderBy),
    description: 'Sort activities by order',
  })
  @IsOptional()
  @IsIn(Object.values(ActivityFeedOrderBy))
  orderBy?: ActivityFeedOrderBy;
}