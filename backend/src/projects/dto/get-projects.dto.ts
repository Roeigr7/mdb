import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PROJECT_SORT_BY = ['createdAt', 'updatedAt', 'name'] as const;
export type ProjectSortBy = (typeof PROJECT_SORT_BY)[number];

export const PROJECT_SORT_ORDER = ['asc', 'desc'] as const;
export type ProjectSortOrder = (typeof PROJECT_SORT_ORDER)[number];

export class GetProjectsDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    example: 'react',
    description: 'Case-insensitive search on name and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: PROJECT_SORT_BY,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn([...PROJECT_SORT_BY])
  sortBy: ProjectSortBy = 'createdAt';

  @ApiPropertyOptional({
    enum: PROJECT_SORT_ORDER,
    default: 'desc',
  })
  @IsOptional()
  @IsIn([...PROJECT_SORT_ORDER])
  sortOrder: ProjectSortOrder = 'desc';
}
