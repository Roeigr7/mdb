import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  RevenueStatus,
  TransactionSource,
} from '../../generated/prisma/client.js';

function optionalTrimmedString() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });
}

export class UpdateRevenueDto {
  @ApiPropertyOptional({ example: 'מקדמה', maxLength: 500 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'לקוח ב', maxLength: 200, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(200)
  customer?: string | null;

  @ApiPropertyOptional({ example: 5000, description: 'Must be greater than 0' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ example: 750, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  vatAmount?: number | null;

  @ApiPropertyOptional({
    example: '2026-09-15T00:00:00.000Z',
    description: 'ISO 8601 date string',
  })
  @IsOptional()
  @IsISO8601()
  date?: string;

  @ApiPropertyOptional({
    enum: RevenueStatus,
    example: RevenueStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RevenueStatus)
  status?: RevenueStatus;

  @ApiPropertyOptional({ maxLength: 100, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(100)
  documentNumber?: string | null;

  @ApiPropertyOptional({ maxLength: 1000, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(1000)
  documentUrl?: string | null;

  @ApiPropertyOptional({ example: 'ILS', maxLength: 10, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(10)
  currency?: string | null;

  @ApiPropertyOptional({ maxLength: 100, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(100)
  paymentMethod?: string | null;

  @ApiPropertyOptional({ enum: TransactionSource })
  @IsOptional()
  @IsEnum(TransactionSource)
  source?: TransactionSource;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @IsPositive()
  documentId?: number | null;
}
