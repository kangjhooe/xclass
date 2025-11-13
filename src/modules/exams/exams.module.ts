import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamSchedule } from './entities/exam-schedule.entity';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { Question } from './entities/question.entity';
import { Stimulus } from './entities/stimulus.entity';
import { QuestionShare } from './entities/question-share.entity';
import { GradeConversion } from './entities/grade-conversion.entity';
import { ExamWeight } from './entities/exam-weight.entity';
import { QuestionItemAnalysis } from './entities/question-item-analysis.entity';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exam,
      ExamQuestion,
      ExamSchedule,
      ExamAttempt,
      QuestionBank,
      Question,
      Stimulus,
      QuestionShare,
      GradeConversion,
      ExamWeight,
      QuestionItemAnalysis,
    ]),
    StorageModule,
    NotificationsModule,
    TeachersModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}

