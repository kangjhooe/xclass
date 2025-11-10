import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  headId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

