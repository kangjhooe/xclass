import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

