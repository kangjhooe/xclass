import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';
import { Graduation } from './entities/graduation.entity';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [TypeOrmModule.forFeature([Graduation]), StudentsModule],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}

