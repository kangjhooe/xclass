import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

