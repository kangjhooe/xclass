import { PartialType } from '@nestjs/mapped-types';
import { CreateOutgoingLetterDto } from './create-outgoing-letter.dto';

export class UpdateOutgoingLetterDto extends PartialType(
  CreateOutgoingLetterDto,
) {}
