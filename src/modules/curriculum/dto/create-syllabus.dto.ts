import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateSyllabusDto {
  @IsNumber()
  curriculumId: number;

  @IsNumber()
  subjectId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  totalHours?: number;

  @IsNumber()
  @IsOptional()
  totalMeetings?: number;

  @IsString()
  @IsOptional()
  learningObjectives?: string;

  @IsString()
  @IsOptional()
  assessmentMethods?: string;

  @IsString()
  @IsOptional()
  learningResources?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

