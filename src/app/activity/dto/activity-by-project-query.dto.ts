import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";
import { ActivityFeedOrderBy } from "src/constants/activity.constants";

export class ActivityByProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: Object.values(ActivityFeedOrderBy),
    description: 'Sort activities by order',
  })
  @IsOptional()
  @IsIn(Object.values(ActivityFeedOrderBy))
  orderBy?: ActivityFeedOrderBy;
}