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
import { TransactionSource } from '../../generated/prisma/client.js';

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

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'הובלה', maxLength: 500 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'Transportation',
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(100)
  category?: string | null;

  @ApiPropertyOptional({ example: 850, description: 'Must be greater than 0' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ example: 127.5, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0)
  vatAmount?: number | null;

  @ApiPropertyOptional({
    example: '2026-09-17T00:00:00.000Z',
    description: 'ISO 8601 date string',
  })
  @IsOptional()
  @IsISO8601()
  date?: string;

  @ApiPropertyOptional({ example: 'ABC Ltd', maxLength: 200, nullable: true })
  @IsOptional()
  @optionalTrimmedString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(200)
  supplier?: string | null;

  @ApiPropertyOptional({
    example: 'INV-12345',
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
