import { PartialType } from '@nestjs/mapped-types';
import { CreateSppPaymentDto } from './create-spp-payment.dto';

export class UpdateSppPaymentDto extends PartialType(CreateSppPaymentDto) {}

