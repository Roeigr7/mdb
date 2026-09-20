import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'David' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'david@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
