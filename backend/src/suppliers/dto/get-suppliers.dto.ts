import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const SUPPLIER_SORT_BY = ['createdAt', 'updatedAt', 'name'] as const;
export type SupplierSortBy = (typeof SUPPLIER_SORT_BY)[number];

export const SUPPLIER_SORT_ORDER = ['asc', 'desc'] as const;
export type SupplierSortOrder = (typeof SUPPLIER_SORT_ORDER)[number];

export class GetSuppliersDto {
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
    example: 'פלדה',
    description: 'Case-insensitive search on name, email, phone, and notes',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: SUPPLIER_SORT_BY,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn([...SUPPLIER_SORT_BY])
  sortBy: SupplierSortBy = 'createdAt';

  @ApiPropertyOptional({
    enum: SUPPLIER_SORT_ORDER,
    default: 'desc',
  })
  @IsOptional()
  @IsIn([...SUPPLIER_SORT_ORDER])
  sortOrder: SupplierSortOrder = 'desc';
}
