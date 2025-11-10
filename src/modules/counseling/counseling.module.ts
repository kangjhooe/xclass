import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounselingController } from './counseling.controller';
import { CounselingService } from './counseling.service';
import { CounselingSession } from './entities/counseling-session.entity';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CounselingSession]),
    StudentsModule,
    TeachersModule,
  ],
  controllers: [CounselingController],
  providers: [CounselingService],
  exports: [CounselingService],
})
export class CounselingModule {}

