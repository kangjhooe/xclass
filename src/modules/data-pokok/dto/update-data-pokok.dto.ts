import { PartialType } from '@nestjs/mapped-types';
import { CreateDataPokokDto } from './create-data-pokok.dto';

export class UpdateDataPokokDto extends PartialType(CreateDataPokokDto) {}

