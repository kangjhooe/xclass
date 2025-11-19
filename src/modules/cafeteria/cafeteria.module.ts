
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaController } from './cafeteria.controller';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaMenu } from './entities/cafeteria-menu.entity';
import { CafeteriaOrder } from './entities/cafeteria-order.entity';
import { CafeteriaOrderItem } from './entities/cafeteria-order-item.entity';
import { CafeteriaPayment } from './entities/cafeteria-payment.entity';
import { CafeteriaOutlet } from './entities/cafeteria-outlet.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CafeteriaOutlet,
      CafeteriaMenu,
      CafeteriaOrder,
      CafeteriaOrderItem,
      CafeteriaPayment,
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [CafeteriaController],
  providers: [CafeteriaService],
  exports: [CafeteriaService],
})
export class CafeteriaModule {}

