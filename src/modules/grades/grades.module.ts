import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { StudentGrade } from './entities/student-grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentGrade])],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
