import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  receiverId: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsEnum(['normal', 'urgent', 'important'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

