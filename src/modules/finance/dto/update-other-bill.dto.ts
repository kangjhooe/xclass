import { PartialType } from '@nestjs/mapped-types';
import { CreateOtherBillDto } from './create-other-bill.dto';

export class UpdateOtherBillDto extends PartialType(CreateOtherBillDto) {}

