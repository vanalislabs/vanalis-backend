import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { ProjectStatus } from "prisma/generated/enums";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";

export class BrowseProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['ALL', ProjectStatus.OPEN, ProjectStatus.COMPLETED],
    description: 'Filter projects by status',
  })
  @IsOptional()
  @IsIn(['ALL', ProjectStatus.OPEN, ProjectStatus.COMPLETED])
  status?: Exclude<ProjectStatus, 'DRAFT' | 'PUBLISHED'> | 'ALL';

  @ApiPropertyOptional({
    enum: ['createdAt', 'title', 'deadline', 'totalRewardPool', 'submissionsCount'],
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsIn(['createdAt', 'title', 'deadline', 'totalRewardPool', 'submissionsCount'])
  sortBy?: 'createdAt' | 'title' | 'deadline' | 'totalRewardPool' | 'submissionsCount';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}