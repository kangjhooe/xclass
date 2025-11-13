import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { CompetencyType } from '../entities/competency.entity';

export class CreateCompetencyDto {
  @IsNumber()
  syllabusId: number;

  @IsEnum(CompetencyType)
  type: CompetencyType;

  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

