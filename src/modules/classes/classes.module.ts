import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassRoom } from './entities/class-room.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassRoom, AcademicYear])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
