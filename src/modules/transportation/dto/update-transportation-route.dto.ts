import { PartialType } from '@nestjs/mapped-types';
import { CreateTransportationRouteDto } from './create-transportation-route.dto';

export class UpdateTransportationRouteDto extends PartialType(CreateTransportationRouteDto) {}

