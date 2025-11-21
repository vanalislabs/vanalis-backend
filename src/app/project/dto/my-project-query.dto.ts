import { ProjectStatus } from "prisma/generated/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { IsIn } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";

export class MyProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['ALL', ProjectStatus.OPEN, ProjectStatus.COMPLETED],
    description: 'Filter projects by status',
  })
  @IsOptional()
  @IsIn(['ALL', ProjectStatus.OPEN, ProjectStatus.COMPLETED])
  status?: Exclude<ProjectStatus, 'DRAFT' | 'PUBLISHED'> | 'ALL';
}