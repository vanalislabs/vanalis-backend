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
}