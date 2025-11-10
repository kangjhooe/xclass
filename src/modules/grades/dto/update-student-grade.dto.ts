import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentGradeDto } from './create-student-grade.dto';

export class UpdateStudentGradeDto extends PartialType(CreateStudentGradeDto) {}

