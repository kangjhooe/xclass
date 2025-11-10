import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestBookDto } from './create-guest-book.dto';

export class UpdateGuestBookDto extends PartialType(CreateGuestBookDto) {}

