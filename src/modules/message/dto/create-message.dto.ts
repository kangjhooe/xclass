import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsOptional()
  receiverId?: number;

  @IsNumber()
  @IsOptional()
  recipient_id?: number;

  @IsEnum(['user', 'class', 'all'])
  @IsOptional()
  recipient_type?: 'user' | 'class' | 'all';

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsEnum(['low', 'medium', 'high', 'normal', 'urgent', 'important'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  @IsNumber()
  @IsOptional()
  conversationId?: number;
}

