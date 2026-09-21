import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetAnalyticsQueryDto {
  @ApiPropertyOptional({
    example: 6,
    description: 'When set, scope analytics to a single owned project',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;
}
