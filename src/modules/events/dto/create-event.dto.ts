import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import {
  EventType,
  EventCategory,
  EventStatus,
} from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  organizer?: string;

  @IsArray()
  @IsOptional()
  targetAudience?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number;

  @IsBoolean()
  @IsOptional()
  registrationRequired?: boolean;

  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  attachments?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

