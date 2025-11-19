import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAttendanceDto } from './create-employee-attendance.dto';

export class UpdateEmployeeAttendanceDto extends PartialType(CreateEmployeeAttendanceDto) {}

