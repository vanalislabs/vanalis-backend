import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";
import { ActivityAction } from "src/constants/activity.constants";

export class MyActivitiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['ALL', ...Object.values(ActivityAction)],
    description: 'Filter activities by action',
  })
  @IsOptional()
  @IsIn(['ALL', ...Object.values(ActivityAction)])
  action?: ActivityAction | 'ALL';

  @ApiPropertyOptional({
    enum: ['createdAt'],
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsIn(['createdAt'])
  sortBy?: 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}