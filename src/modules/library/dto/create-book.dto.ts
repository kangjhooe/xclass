import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { BookStatus, BookCondition } from '../entities/book.entity';

export class CreateBookDto {
  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  publisher: string;

  @IsNumber()
  @IsOptional()
  publicationYear?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsNumber()
  @IsOptional()
  pages?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsNumber()
  @IsOptional()
  totalCopies?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  shelfNumber?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsEnum(BookStatus)
  @IsOptional()
  status?: BookStatus;

  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsString()
  @IsOptional()
  donor?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  allowDownload?: boolean;
}

