import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;
}

export class SendSMSDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;

  @IsNumber()
  @IsOptional()
  channelId?: number;
}

export class SendWhatsAppDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;

  @IsNumber()
  @IsOptional()
  channelId?: number;

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsObject()
  @IsOptional()
  templateParams?: Record<string, string>;
}

export class SendPushDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  templateId?: number;
}

export class SendFromTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  templateId: number;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, string>;
}

