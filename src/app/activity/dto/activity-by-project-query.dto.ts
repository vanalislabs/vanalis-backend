import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/commons/dto/pagination-query.dto";

export class ActivityByProjectQueryDto extends PaginationQueryDto {
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