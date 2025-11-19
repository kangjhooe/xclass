import {
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateBatchPromotionDto {
  @IsNumber()
  academicYear: number;

  @IsNumber()
  @IsOptional()
  fromClassId?: number;

  @IsNumber()
  toClassId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  studentIds: number[];

  @IsString()
  @IsOptional()
  notes?: string;
}

