import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateClassRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @IsOptional()
  homeroomTeacherId?: number;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

