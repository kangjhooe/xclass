import { PartialType } from '@nestjs/mapped-types';
import { CreateTransportationScheduleDto } from './create-transportation-schedule.dto';

export class UpdateTransportationScheduleDto extends PartialType(CreateTransportationScheduleDto) {}

