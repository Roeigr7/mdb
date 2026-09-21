import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateRevenueDto {
  @ApiProperty({ example: 'תשלום פרויקט', maxLength: 500 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ example: 'לאסם', maxLength: 200, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(200)
  customer?: string | null;

  @ApiProperty({ example: 8500, description: 'Must be greater than 0' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 1275, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  vatAmount?: number | null;

  @ApiProperty({
    example: '2026-09-18T00:00:00.000Z',
    description: 'ISO 8601 date string',
  })
  @IsISO8601()
  date: string;

  @ApiProperty({
    enum: RevenueStatus,
    example: RevenueStatus.PAID,
  })
  @IsEnum(RevenueStatus)
  status: RevenueStatus;

  @ApiPropertyOptional({
    example: 'INV-99',
    maxLength: 100,
    nullable: true,
  })
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

  @ApiPropertyOptional({
    enum: TransactionSource,
    example: TransactionSource.MANUAL,
  })
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
