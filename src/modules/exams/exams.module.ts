import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamSchedule } from './entities/exam-schedule.entity';
import { ExamAttempt } from './entities/exam-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, ExamQuestion, ExamSchedule, ExamAttempt]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}

