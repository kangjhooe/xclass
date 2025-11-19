import {
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';

export class CreateBatchGraduationDto {
  @IsNumber()
  academic_year_id: number;

  @IsNumber()
  @IsOptional()
  class_id?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  student_ids: number[];

  @IsNumber()
  graduationYear: number;

  @IsDateString()
  @IsOptional()
  graduation_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

