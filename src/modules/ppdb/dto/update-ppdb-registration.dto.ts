import { PartialType } from '@nestjs/mapped-types';
import { CreatePpdbRegistrationDto } from './create-ppdb-registration.dto';

export class UpdatePpdbRegistrationDto extends PartialType(CreatePpdbRegistrationDto) {}

