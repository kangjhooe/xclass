import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionModuleDto } from './create-position-module.dto';

export class UpdatePositionModuleDto extends PartialType(CreatePositionModuleDto) {}

