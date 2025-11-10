import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class FilterActivityLogDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  modelType?: string;

  @IsNumber()
  @IsOptional()
  modelId?: number;

  @IsString()
  @IsOptional()
  action?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

