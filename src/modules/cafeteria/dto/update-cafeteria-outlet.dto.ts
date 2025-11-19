import { PartialType } from '@nestjs/mapped-types';
import { CreateCafeteriaOutletDto } from './create-cafeteria-outlet.dto';

export class UpdateCafeteriaOutletDto extends PartialType(
  CreateCafeteriaOutletDto,
) {}


