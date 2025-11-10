import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomingLetterDto } from './create-incoming-letter.dto';

export class UpdateIncomingLetterDto extends PartialType(
  CreateIncomingLetterDto,
) {}
