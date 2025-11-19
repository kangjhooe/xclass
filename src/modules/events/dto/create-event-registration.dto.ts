import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { RegistrationStatus } from '../entities/event-registration.entity';

export class CreateEventRegistrationDto {
  @IsNumber()
  eventId: number;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;

  @IsNumber()
  @IsOptional()
  staffId?: number;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paymentAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

