import {
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  IsNumber as IsNumberValidator,
  Min,
  Max,
} from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsNumber()
  employeeId: number;

  @IsDateString()
  reviewDate: string;

  @IsString()
  reviewPeriod: string;

  @IsNumberValidator()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  strengths: string;

  @IsString()
  @IsOptional()
  weaknesses?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

