import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { ExportImportModule } from '../export-import/export-import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    ExportImportModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
