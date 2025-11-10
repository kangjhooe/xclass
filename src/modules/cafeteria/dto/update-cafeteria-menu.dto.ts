import { PartialType } from '@nestjs/mapped-types';
import { CreateCafeteriaMenuDto } from './create-cafeteria-menu.dto';

export class UpdateCafeteriaMenuDto extends PartialType(CreateCafeteriaMenuDto) {}

