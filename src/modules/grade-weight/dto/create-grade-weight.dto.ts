import { IsString, IsNumber, IsBoolean, IsOptional, Max, Min } from 'class-validator';

export class CreateGradeWeightDto {
  @IsString()
  assignmentType: string;

  @IsString()
  assignmentLabel: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercentage: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

