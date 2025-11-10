import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateTransportationScheduleDto {
  @IsNumber()
  routeId: number;

  @IsString()
  departureTime: string;

  @IsString()
  arrivalTime: string;

  @IsNumber()
  @IsOptional()
  currentPassengers?: number;

  @IsEnum(['scheduled', 'in_transit', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}

