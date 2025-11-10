import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
  status: string;
}

