import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateTransportationRouteDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

