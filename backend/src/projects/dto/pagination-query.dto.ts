import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const PROJECT_SORT_FIELDS = [
  'name',
  'description',
  'createdAt',
  'updatedAt',
] as const;

export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn([...PROJECT_SORT_FIELDS])
  sortBy?: ProjectSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}
