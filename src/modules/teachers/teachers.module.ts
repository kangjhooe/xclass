import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { ExportImportModule } from '../export-import/export-import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Subject]),
    ExportImportModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
