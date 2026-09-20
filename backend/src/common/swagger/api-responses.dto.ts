import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Roei' })
  name: string;

  @ApiProperty({ example: 'roei@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Short-lived JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived refresh token' })
  refreshToken: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Roei' })
  name: string;

  @ApiProperty({ example: 'roei@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My First Project' })
  name: string;

  @ApiPropertyOptional({ example: 'A test project', nullable: true })
  description: string | null;

  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
