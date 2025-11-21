import { ApiPropertyOptional } from "@nestjs/swagger";
import { SubmissionStatus } from "prisma/generated/enums";
import { IsOptional } from "class-validator";
import { IsIn } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";

export class MySubmissionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['ALL', ...Object.values(SubmissionStatus)],
    description: 'Filter submissions by status',
  })
  @IsOptional()
  @IsIn(['ALL', ...Object.values(SubmissionStatus)])
  status?: SubmissionStatus | 'ALL';
}