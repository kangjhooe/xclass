import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';
import { ChannelType, ChannelProvider } from '../entities/notification-channel.entity';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsEnum(ChannelProvider)
  provider: ChannelProvider;

  @IsObject()
  @IsNotEmpty()
  config: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

