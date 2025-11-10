import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentTransferDto } from './create-student-transfer.dto';

export class UpdateStudentTransferDto extends PartialType(CreateStudentTransferDto) {}

