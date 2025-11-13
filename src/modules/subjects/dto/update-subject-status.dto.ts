import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubjectStatusDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isElective?: boolean;
}
