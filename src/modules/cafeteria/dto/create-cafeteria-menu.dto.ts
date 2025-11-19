import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateCafeteriaMenuDto {
  @IsNumber()
  canteenId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['food', 'drink', 'snack'])
  category: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  image?: string;
}

