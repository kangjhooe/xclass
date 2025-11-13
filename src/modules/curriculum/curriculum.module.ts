import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { Curriculum } from './entities/curriculum.entity';
import { Syllabus } from './entities/syllabus.entity';
import { LearningMaterial } from './entities/learning-material.entity';
import { Competency } from './entities/competency.entity';
import { CurriculumSchedule } from './entities/curriculum-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curriculum,
      Syllabus,
      LearningMaterial,
      Competency,
      CurriculumSchedule,
    ]),
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}

