import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  id: number;

  @IsNumber()
  quantity: number;
}

export class CreateCafeteriaOrderDto {
  @IsNumber()
  studentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  menuItems: OrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

