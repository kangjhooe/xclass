import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { Promotion } from './entities/promotion.entity';
import { Student } from '../students/entities/student.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, Student, ClassRoom]),
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}

