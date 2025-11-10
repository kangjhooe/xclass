import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  @IsOptional()
  fromClassId?: number;

  @IsNumber()
  toClassId: number;

  @IsNumber()
  academicYear: number;

  @IsEnum(['pending', 'approved', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  finalGrade?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

