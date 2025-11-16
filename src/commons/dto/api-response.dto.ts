import { ApiProperty } from '@nestjs/swagger';
import { type PaginationMeta } from '../paginator.common';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Operation successful.' })
  message: string;

  @ApiProperty({ type: Object })
  data: T;

  @ApiProperty()
  meta: PaginationMeta;
}
