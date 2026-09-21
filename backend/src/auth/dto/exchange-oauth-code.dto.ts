import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ExchangeOAuthCodeDto {
  @ApiProperty({
    description: 'One-time OAuth exchange code from the frontend callback URL',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  code: string;
}
