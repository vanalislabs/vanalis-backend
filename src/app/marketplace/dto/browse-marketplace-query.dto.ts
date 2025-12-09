import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/commons/dto/pagination-query.dto';

export class BrowseMarketplaceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum price (in base units)',
  })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({
    description: 'Maximum price (in base units)',
  })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({
    enum: ['price', 'createdAt', 'totalSalesCount'],
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsIn(['price', 'createdAt', 'totalSalesCount'])
  sortBy?: 'price' | 'createdAt' | 'totalSalesCount';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
