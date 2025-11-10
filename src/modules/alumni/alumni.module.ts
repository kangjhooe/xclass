import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { Alumni } from './entities/alumni.entity';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alumni]),
    StudentsModule,
  ],
  controllers: [AlumniController],
  providers: [AlumniService],
  exports: [AlumniService],
})
export class AlumniModule {}

