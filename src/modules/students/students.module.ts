import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { ExportImportModule } from '../export-import/export-import.module';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, AcademicYear]), ExportImportModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
