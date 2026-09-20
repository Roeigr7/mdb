import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Roei' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'roei@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
