import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({
    description:
      'Required when the account already has a password. Omit when setting a password for the first time (OAuth-only accounts).',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
