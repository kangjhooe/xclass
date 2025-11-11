import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevokeAccessDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

