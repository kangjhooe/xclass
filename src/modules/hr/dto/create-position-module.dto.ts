import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreatePositionModuleDto {
  @IsNumber()
  positionId: number;

  @IsString()
  moduleKey: string;

  @IsString()
  moduleName: string;

  @IsBoolean()
  @IsOptional()
  canView?: boolean = true;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canUpdate?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean = false;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

