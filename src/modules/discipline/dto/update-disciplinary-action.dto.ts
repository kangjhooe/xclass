import { PartialType } from '@nestjs/mapped-types';
import { CreateDisciplinaryActionDto } from './create-disciplinary-action.dto';

export class UpdateDisciplinaryActionDto extends PartialType(CreateDisciplinaryActionDto) {}

