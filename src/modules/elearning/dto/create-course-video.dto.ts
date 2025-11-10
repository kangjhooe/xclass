import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { VideoSource } from '../entities/course-video.entity';

export class CreateCourseVideoDto {
  @IsNumber()
  courseId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(VideoSource)
  source: VideoSource;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  videoId?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  subtitleUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

