import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseAnnouncementDto {
  @IsNumber()
  courseId: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isImportant?: boolean;
}

