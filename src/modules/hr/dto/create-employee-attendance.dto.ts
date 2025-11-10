
import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateEmployeeAttendanceDto {
  @IsNumber()
  employeeId: number;

  @IsDateString()
  attendanceDate: string;

  @IsString()
  @IsOptional()
  checkInTime?: string;

  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @IsEnum(['present', 'absent', 'late', 'excused'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

