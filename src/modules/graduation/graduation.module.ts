import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';
import { Graduation } from './entities/graduation.entity';
import { StudentsModule } from '../students/students.module';
import { AcademicYearModule } from '../academic-year/academic-year.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Graduation]),
    StudentsModule,
    AcademicYearModule,
    ClassesModule,
  ],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}

