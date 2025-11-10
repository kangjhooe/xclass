import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  employeeNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  positionId: number;

  @IsNumber()
  departmentId: number;

  @IsDateString()
  hireDate: string;

  @IsNumber()
  salary: number;

  @IsEnum(['active', 'inactive', 'terminated'])
  @IsOptional()
  status?: string;
}

