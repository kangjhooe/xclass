import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { CreateTeacherDto } from './create-teacher.dto';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  subjectIds?: number[];
}

