import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'מפעל פלדה צפון', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'sales@steel.co.il', nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string | null;

  @ApiPropertyOptional({ example: '03-1234567', nullable: true, maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'ספק מועדף לפלטות',
    nullable: true,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
