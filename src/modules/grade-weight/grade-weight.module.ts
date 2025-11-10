import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeWeightController } from './grade-weight.controller';
import { GradeWeightService } from './grade-weight.service';
import { GradeWeight } from './entities/grade-weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeWeight])],
  controllers: [GradeWeightController],
  providers: [GradeWeightService],
  exports: [GradeWeightService],
})
export class GradeWeightModule {}

